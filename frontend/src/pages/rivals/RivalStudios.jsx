import { useEffect, useState } from "react";
import {
  Swords, Trophy, Users, DollarSign, Star,
  Film, TrendingUp, TrendingDown, Clock,
  RefreshCw, Zap, Building2, Target, BarChart3
} from "lucide-react";

import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useSelector } from "react-redux";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PERSONALITY_META = {
  BLOCKBUSTER: { label: "Blockbuster",  color: "text-orange-400",  bg: "bg-orange-500/15", border: "border-orange-500/30", dot: "bg-orange-400" },
  PRESTIGE:    { label: "Prestige",     color: "text-yellow-400",  bg: "bg-yellow-500/15", border: "border-yellow-500/30", dot: "bg-yellow-400" },
  INDIE:       { label: "Indie",        color: "text-green-400",   bg: "bg-green-500/15",  border: "border-green-500/30",  dot: "bg-green-400"  },
  COMMERCIAL:  { label: "Commercial",   color: "text-blue-400",    bg: "bg-blue-500/15",   border: "border-blue-500/30",   dot: "bg-blue-400"   },
  CHAOTIC:     { label: "Chaotic",      color: "text-purple-400",  bg: "bg-purple-500/15", border: "border-purple-500/30", dot: "bg-purple-400" },
};

const VERDICT_STYLE = {
  ALL_TIME_BLOCKBUSTER: { text: "text-yellow-400",  bg: "bg-yellow-500/20",  label: "✨ ALL-TIME BLOCKBUSTER" },
  LEGENDARY:   { text: "text-yellow-400",  bg: "bg-yellow-500/20",  label: "✨ LEGENDARY"   },
  BLOCKBUSTER: { text: "text-orange-400",  bg: "bg-orange-500/20",  label: "💥 BLOCKBUSTER" },
  HIT:         { text: "text-green-400",   bg: "bg-green-500/20",   label: "🎉 HIT"          },
  AVERAGE:     { text: "text-slate-400",   bg: "bg-slate-700/30",   label: "😐 AVERAGE"     },
  FLOP:        { text: "text-red-400",     bg: "bg-red-500/20",     label: "💸 FLOP"         },
  DISASTER:    { text: "text-red-500",     bg: "bg-red-900/30",     label: "💀 DISASTER"    },
};

const fmt = (n) => (n || 0).toLocaleString();

const VerdictPill = ({ verdict }) => {
  const s = VERDICT_STYLE[verdict] || VERDICT_STYLE.AVERAGE;
  return (
    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
};

// Simple donut chart via SVG
const DonutChart = ({ slices }) => {
  const r = 54;
  const cx = 60;
  const cy = 60;
  const circumference = 2 * Math.PI * r;

  let cumulativePercent = 0;
  const paths = slices.map((slice, i) => {
    const startPercent = cumulativePercent;
    cumulativePercent += slice.percent;
    const startAngle = startPercent * 360 - 90;
    const endAngle   = cumulativePercent * 360 - 90;
    const largeArc   = slice.percent > 0.5 ? 1 : 0;

    const toRad = (deg) => (deg * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startAngle));
    const y1 = cy + r * Math.sin(toRad(startAngle));
    const x2 = cx + r * Math.cos(toRad(endAngle));
    const y2 = cy + r * Math.sin(toRad(endAngle));

    if (slice.percent === 0) return null;
    if (slice.percent >= 1) {
      return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={slice.color} strokeWidth="14" />;
    }

    return (
      <path
        key={i}
        d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
        fill={slice.color}
        opacity="0.85"
      />
    );
  });

  return (
    <svg viewBox="0 0 120 120" className="w-full h-full">
      {paths}
      <circle cx={cx} cy={cy} r={r - 14} fill="#111827" />
    </svg>
  );
};

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

const RivalStudios = () => {
  const [rivals, setRivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.auth);

  const playerFans    = user?.studio?.fans    || 0;
  const playerPrestige= user?.studio?.prestige|| 0;
  const playerMoney   = user?.studio?.money   || 0;
  const playerName    = user?.studio?.name    || "Your Studio";

  const fetchRivals = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/rival-studios");
      setRivals(res.data.rivalStudios || []);
    } catch (err) {
      setError("Failed to load rival studios. Run a simulation first to initialize them.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRivals(); }, []);

  // Market share computation
  const totalFans = playerFans + rivals.reduce((s, r) => s + (r.fans || 0), 0);
  const playerShare = totalFans > 0 ? (playerFans / totalFans) : 1;

  // Leaderboard — combine player + rivals, sort by fans desc
  const leaderboard = [
    { name: playerName, fans: playerFans, prestige: playerPrestige, money: playerMoney, isPlayer: true, personality: null },
    ...rivals.map((r) => ({ ...r, isPlayer: false })),
  ].sort((a, b) => (b.fans || 0) - (a.fans || 0));

  // Donut slices
  const DONUT_COLORS = ["#8b5cf6", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#a855f7"];
  const donutSlices = leaderboard.map((entry, i) => ({
    name: entry.name,
    percent: totalFans > 0 ? (entry.fans || 0) / totalFans : 0,
    color: entry.isPlayer ? "#8b5cf6" : DONUT_COLORS[i] || "#64748b",
  }));

  const marketPressure = rivals.length > 0
    ? Math.round((1 - playerShare) * 100)
    : 0;

  // Pressure indicator colour
  const pressureColor =
    marketPressure < 30 ? "text-green-400" :
    marketPressure < 55 ? "text-yellow-400" :
    "text-red-400";

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="rounded-3xl bg-gradient-to-r from-red-700 via-rose-600 to-orange-500 p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)", backgroundSize: "20px 20px" }} />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <Swords className="text-white" size={32} />
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">Rival Studios</h1>
            </div>
            <p className="text-rose-100 text-sm sm:text-base">
              {rivals.length > 0
                ? `${rivals.length} AI studios are competing for audience share. Stay ahead.`
                : "Run a simulation to activate the rival studio market."}
            </p>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="text-center space-y-3">
              <RefreshCw className="animate-spin text-violet-400 mx-auto" size={36} />
              <p className="text-slate-400 font-medium">Loading rival studios…</p>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
            <Swords className="text-red-400 mx-auto mb-3" size={32} />
            <p className="text-red-400 font-semibold">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* ── Market Overview Row ───────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Donut + share */}
              <div className="md:col-span-1 bg-[#111827] border border-slate-800 rounded-2xl p-5 flex flex-col items-center gap-4">
                <h2 className="text-white font-bold text-sm uppercase tracking-widest self-start flex items-center gap-2">
                  <BarChart3 size={16} className="text-violet-400" /> Market Share
                </h2>
                <div className="w-32 h-32">
                  <DonutChart slices={donutSlices} />
                </div>
                <div className="w-full space-y-1.5">
                  {donutSlices.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                      <span className="text-slate-300 truncate flex-1">{s.name}</span>
                      <span className="text-slate-400 font-bold shrink-0">{(s.percent * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Competition pressure */}
              <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-4">
                <h2 className="text-white font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                  <Target size={16} className="text-red-400" /> Competition Pressure
                </h2>
                <div className="text-center">
                  <p className={`text-6xl font-black tabular-nums ${pressureColor}`}>
                    {marketPressure}%
                  </p>
                  <p className="text-slate-500 text-xs mt-1">of audience captured by rivals</p>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Low competition</span>
                    <span>Saturated</span>
                  </div>
                  <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${marketPressure}%`,
                        background: marketPressure < 30 ? "#22c55e" : marketPressure < 55 ? "#eab308" : "#ef4444",
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 text-center mt-2">
                    {marketPressure < 30
                      ? "🟢 You dominate the market!"
                      : marketPressure < 55
                      ? "🟡 Moderate competition — keep releasing hits!"
                      : "🔴 Rivals are absorbing your audience — make blockbusters!"}
                  </p>
                </div>
              </div>

              {/* Leaderboard */}
              <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5">
                <h2 className="text-white font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Trophy size={16} className="text-yellow-400" /> Fan Leaderboard
                </h2>
                <div className="space-y-2">
                  {leaderboard.map((entry, rank) => (
                    <div
                      key={entry.name}
                      className={`flex items-center gap-3 p-2.5 rounded-xl transition ${
                        entry.isPlayer
                          ? "bg-violet-600/20 border border-violet-500/30"
                          : "bg-slate-900/40 border border-slate-800"
                      }`}
                    >
                      <span className={`text-sm font-black w-5 text-center shrink-0 ${
                        rank === 0 ? "text-yellow-400" : rank === 1 ? "text-slate-300" : rank === 2 ? "text-orange-400" : "text-slate-600"
                      }`}>
                        {rank + 1}
                      </span>
                      <span className={`flex-1 text-xs font-semibold truncate ${entry.isPlayer ? "text-violet-300" : "text-slate-300"}`}>
                        {entry.name} {entry.isPlayer && <span className="text-violet-400">(You)</span>}
                      </span>
                      <span className="text-xs text-slate-400 font-bold shrink-0">{fmt(entry.fans)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Rival Studio Cards ───────────────────────────── */}
            {rivals.length === 0 ? (
              <div className="bg-[#111827] border border-slate-800 rounded-2xl p-10 text-center">
                <Building2 className="text-slate-600 mx-auto mb-4" size={40} />
                <p className="text-slate-500 text-lg font-semibold">No rival studios yet</p>
                <p className="text-slate-600 text-sm mt-2">
                  Advance the simulation — rivals will automatically appear on your first tick.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {rivals.map((rival) => {
                  const meta = PERSONALITY_META[rival.personality] || PERSONALITY_META.COMMERCIAL;
                  const risingIcon = (rival.stats?.totalRevenue || 0) > 5000000
                    ? <TrendingUp size={14} className="text-green-400" />
                    : <TrendingDown size={14} className="text-red-400" />;

                  return (
                    <div
                      key={rival.id}
                      className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-600 transition-all duration-300 group"
                    >
                      {/* Card header */}
                      <div className="p-5 pb-4 flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${meta.bg} border ${meta.border}`}>
                            <Building2 size={20} className={meta.color} />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-white font-black text-base truncate group-hover:text-violet-300 transition">{rival.name}</h3>
                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border mt-0.5 ${meta.bg} ${meta.color} ${meta.border}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                              {meta.label}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 text-slate-400 text-xs">
                          {risingIcon}
                          <span className="text-slate-500">Lvl {rival.level || 1}</span>
                        </div>
                      </div>

                      {/* Stats row */}
                      <div className="px-5 pb-4 grid grid-cols-3 gap-3">
                        <div className="bg-slate-900/50 rounded-xl p-2.5 text-center">
                          <Users size={13} className="text-blue-400 mx-auto mb-1" />
                          <p className="text-white font-black text-sm">{fmt(rival.fans)}</p>
                          <p className="text-slate-600 text-[9px] uppercase tracking-wider">Fans</p>
                        </div>
                        <div className="bg-slate-900/50 rounded-xl p-2.5 text-center">
                          <Star size={13} className="text-yellow-400 mx-auto mb-1" />
                          <p className="text-white font-black text-sm">{fmt(rival.prestige)}</p>
                          <p className="text-slate-600 text-[9px] uppercase tracking-wider">Prestige</p>
                        </div>
                        <div className="bg-slate-900/50 rounded-xl p-2.5 text-center">
                          <Film size={13} className="text-violet-400 mx-auto mb-1" />
                          <p className="text-white font-black text-sm">{rival.stats?.moviesReleased || 0}</p>
                          <p className="text-slate-600 text-[9px] uppercase tracking-wider">Movies</p>
                        </div>
                      </div>

                      {/* Active movies */}
                      {(rival.activeMovies || []).length > 0 && (
                        <div className="px-5 pb-4">
                          <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-2 font-bold flex items-center gap-1.5">
                            <Clock size={10} /> In Production
                          </p>
                          <div className="space-y-2">
                            {(rival.activeMovies || []).map((m) => {
                              const pct = m.totalWeeks > 0
                                ? Math.round(((m.totalWeeks - m.weeksRemaining) / m.totalWeeks) * 100)
                                : 0;
                              return (
                                <div key={m.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
                                  <div className="flex items-center justify-between mb-1.5">
                                    <p className="text-white text-xs font-semibold truncate flex-1">{m.title}</p>
                                    <span className="text-slate-500 text-[10px] ml-2 shrink-0">{m.weeksRemaining}w left</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                      <div
                                        className="h-full rounded-full bg-violet-500 transition-all duration-500"
                                        style={{ width: `${pct}%` }}
                                      />
                                    </div>
                                    <span className="text-slate-500 text-[10px] shrink-0">{pct}%</span>
                                  </div>
                                  <p className="text-slate-600 text-[10px] mt-1">{m.genre} • Budget: ₹{fmt(m.budget)}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Recent releases */}
                      {(rival.movieHistory || []).length > 0 && (
                        <div className="px-5 pb-5 border-t border-slate-800/60 pt-4">
                          <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-2 font-bold flex items-center gap-1.5">
                            <Zap size={10} /> Recent Releases
                          </p>
                          <div className="space-y-1.5">
                            {[...(rival.movieHistory || [])].reverse().slice(0, 3).map((m) => (
                              <div key={m.id} className="flex items-center justify-between gap-2">
                                <p className="text-slate-400 text-xs truncate flex-1">{m.title}</p>
                                <VerdictPill verdict={m.verdict} />
                              </div>
                            ))}
                          </div>

                          {/* Stats mini-bar */}
                          <div className="mt-3 flex gap-3 text-[10px] text-slate-600">
                            <span className="text-green-500">●</span>
                            <span>{rival.stats?.hits || 0} hits</span>
                            <span className="text-orange-400">●</span>
                            <span>{rival.stats?.blockbusters || 0} blockbusters</span>
                            <span className="text-red-500">●</span>
                            <span>{rival.stats?.flops || 0} flops</span>
                          </div>
                        </div>
                      )}

                      {/* No history yet */}
                      {(rival.movieHistory || []).length === 0 && (rival.activeMovies || []).length === 0 && (
                        <div className="px-5 pb-5 text-center">
                          <p className="text-slate-600 text-xs italic">Gearing up for production…</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default RivalStudios;
