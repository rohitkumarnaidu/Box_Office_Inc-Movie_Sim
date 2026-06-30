import { useEffect, useState } from "react";
import {
  Trophy,
  Star,
  Users,
  IndianRupee,
  TrendingUp,
  RefreshCw,
  Building2,
  Crown,
  Medal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";

const fmt = (n) => (n || 0).toLocaleString();

// The ranking metrics offered in the filter. `value` reads the display number
// for a leaderboard entry for that metric.
const METRICS = [
  { key: "prestige", label: "Prestige", icon: Star, value: (e) => fmt(e.prestige) },
  { key: "fans", label: "Fans", icon: Users, value: (e) => fmt(e.fans) },
  { key: "revenue", label: "Revenue", icon: IndianRupee, value: (e) => `₹${fmt(e.revenue)}` },
  { key: "blockbusters", label: "Blockbusters", icon: Trophy, value: (e) => fmt(e.blockbusters) },
  { key: "level", label: "Studio Level", icon: TrendingUp, value: (e) => `Lvl ${e.studioLevel || 1}` },
];

const rankColor = (rank) =>
  rank === 1
    ? "text-yellow-400"
    : rank === 2
    ? "text-slate-300"
    : rank === 3
    ? "text-orange-400"
    : "text-slate-600";

const RankBadge = ({ rank }) => {
  if (rank === 1) return <Crown size={18} className="text-yellow-400" />;
  if (rank === 2) return <Medal size={18} className="text-slate-300" />;
  if (rank === 3) return <Medal size={18} className="text-orange-400" />;
  return <span className={`text-sm font-black ${rankColor(rank)}`}>{rank}</span>;
};

// A single ranking row. Highlights the current player's studio.
const LeaderboardRow = ({ entry, activeMetric }) => (
  <div
    className={`flex items-center gap-3 p-3 sm:p-4 rounded-2xl border transition ${
      entry.isCurrentUser
        ? "bg-violet-600/20 border-violet-500/40"
        : "bg-[#111827] border-slate-800 hover:border-slate-600"
    }`}
  >
    <div className="w-8 flex items-center justify-center shrink-0">
      <RankBadge rank={entry.rank} />
    </div>

    <div className="w-9 h-9 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-center shrink-0">
      <Building2 size={18} className="text-violet-400" />
    </div>

    <div className="min-w-0 flex-1">
      <p
        className={`font-bold text-sm truncate ${
          entry.isCurrentUser ? "text-violet-300" : "text-white"
        }`}
      >
        {entry.name}
        {entry.isCurrentUser && <span className="text-violet-400"> (You)</span>}
      </p>
      <p className="text-slate-500 text-[11px] truncate">
        {fmt(entry.fans)} fans · {entry.prestige} prestige · Lvl {entry.studioLevel || 1} ·{" "}
        {entry.blockbusters} blockbusters
      </p>
    </div>

    <div className="text-right shrink-0">
      <p className="text-white font-black text-base sm:text-lg tabular-nums">
        {activeMetric.value(entry)}
      </p>
      <p className="text-slate-600 text-[10px] uppercase tracking-wider">
        {activeMetric.label}
      </p>
    </div>
  </div>
);

const Leaderboard = () => {
  const [metric, setMetric] = useState("prestige");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        const res = await api.get(`/leaderboard?metric=${metric}&page=${page}`);
        if (!active) return;
        setData(res.data);
        setError(null);
      } catch {
        if (active) setError("Failed to load the leaderboard. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [metric, page]);

  const selectMetric = (key) => {
    if (key === metric) return;
    setLoading(true);
    setMetric(key);
    setPage(1);
  };

  const goToPage = (next) => {
    setLoading(true);
    setPage(next);
  };

  const activeMetric = METRICS.find((m) => m.key === metric) || METRICS[0];
  const rows = data?.leaderboard || [];
  const currentUser = data?.currentUser || null;
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-3xl bg-gradient-to-r from-violet-700 via-fuchsia-600 to-amber-500 p-6 sm:p-8 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)",
              backgroundSize: "20px 20px",
            }}
          />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="text-white" size={32} />
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">
                Studio Leaderboards
              </h1>
            </div>
            <p className="text-amber-100 text-sm sm:text-base">
              See how your studio ranks against {total > 0 ? total : "every"} studio
              {total === 1 ? "" : "s"} across the industry.
            </p>
          </div>
        </div>

        {/* Metric filter */}
        <div className="flex flex-wrap gap-2">
          {METRICS.map((m) => {
            const Icon = m.icon;
            const isActive = m.key === metric;
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => selectMetric(m.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition ${
                  isActive
                    ? "bg-violet-600 border-violet-500 text-white"
                    : "bg-[#111827] border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                }`}
              >
                <Icon size={16} />
                {m.label}
              </button>
            );
          })}
        </div>

        {/* Your rank */}
        {currentUser && (
          <div className="bg-[#111827] border border-violet-500/30 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 flex items-center justify-center shrink-0">
              <RankBadge rank={currentUser.rank} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-violet-300 font-bold text-sm truncate">
                {currentUser.name} <span className="text-violet-400">(You)</span>
              </p>
              <p className="text-slate-500 text-[11px]">
                Ranked #{currentUser.rank} by {activeMetric.label.toLowerCase()}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-white font-black text-lg tabular-nums">
                {activeMetric.value(currentUser)}
              </p>
              <p className="text-slate-600 text-[10px] uppercase tracking-wider">
                {activeMetric.label}
              </p>
            </div>
          </div>
        )}

        {/* States */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="text-center space-y-3">
              <RefreshCw className="animate-spin text-violet-400 mx-auto" size={36} />
              <p className="text-slate-400 font-medium">Loading leaderboard…</p>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
            <Trophy className="text-red-400 mx-auto mb-3" size={32} />
            <p className="text-red-400 font-semibold">{error}</p>
          </div>
        )}

        {!loading && !error && rows.length === 0 && (
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-10 text-center">
            <Building2 className="text-slate-600 mx-auto mb-4" size={40} />
            <p className="text-slate-500 text-lg font-semibold">No studios to rank yet</p>
            <p className="text-slate-600 text-sm mt-2">
              Studios will appear here as players build and release movies.
            </p>
          </div>
        )}

        {/* Leaderboard list */}
        {!loading && !error && rows.length > 0 && (
          <>
            <div className="space-y-2">
              {rows.map((entry) => (
                <LeaderboardRow
                  key={entry.studioId}
                  entry={entry}
                  activeMetric={activeMetric}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[#111827] border border-slate-800 text-slate-300 text-sm font-semibold disabled:opacity-40 hover:border-slate-600 transition"
                >
                  <ChevronLeft size={16} /> Prev
                </button>
                <span className="text-slate-400 text-sm font-semibold">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= totalPages}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[#111827] border border-slate-800 text-slate-300 text-sm font-semibold disabled:opacity-40 hover:border-slate-600 transition"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Leaderboard;
