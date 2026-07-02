import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Trophy, Star, Award, TrendingUp, Medal } from "lucide-react";
import { fetchAwards } from "../../features/awards/awardsSlice";
import DashboardLayout from "../../layouts/DashboardLayout";
import { Skeleton } from "../../components/ui/Skeleton";

// Map known category names to a display color
const CATEGORY_COLORS = {
  "Best Picture":    "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  "Best Director":   "text-violet-400 bg-violet-400/10 border-violet-400/30",
  "Best Actor":      "text-sky-400    bg-sky-400/10    border-sky-400/30",
  "Best Actress":    "text-pink-400   bg-pink-400/10   border-pink-400/30",
  "Best Screenplay": "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
};

const getCategoryStyle = (category) =>
  CATEGORY_COLORS[category] ?? "text-slate-300 bg-slate-800/60 border-slate-600";

const AwardsSeasonDashboard = () => {
  const dispatch = useDispatch();
  const { data: awards, loading, error } = useSelector((state) => state.awards);

  useEffect(() => {
    dispatch(fetchAwards());
  }, [dispatch]);

  // Group awards by year (season)
  const byYear = useMemo(() => {
    const map = {};
    for (const award of awards) {
      const yr = award.year ?? "Unknown";
      if (!map[yr]) map[yr] = { nominations: [], wins: [] };
      if (award.type === "nomination") {
        map[yr].nominations.push(award);
      } else {
        map[yr].wins.push(award);
      }
    }
    // Sort descending by year
    return Object.entries(map).sort(([a], [b]) => Number(b) - Number(a));
  }, [awards]);

  const totalWins         = awards.filter((a) => a.type !== "nomination").length;
  const totalNominations  = awards.filter((a) => a.type === "nomination").length;
  const totalAwards       = awards.length;
  const winRate           = totalAwards > 0 ? ((totalWins / totalAwards) * 100).toFixed(1) : 0;

  // Hall of Fame: movies that appear as a win
  const hallOfFame = useMemo(() => {
    const seen = new Set();
    const movies = [];
    for (const award of awards) {
      if (award.type !== "nomination" && award.movieTitle && !seen.has(award.movieTitle)) {
        seen.add(award.movieTitle);
        movies.push(award);
      }
    }
    return movies;
  }, [awards]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-8 p-6">
          <Skeleton className="h-10 w-72" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
          </div>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-xl">
            Failed to load awards: {error}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Award className="text-yellow-400 w-10 h-10" />
          <div>
            <h1 className="text-4xl font-bold text-white">Awards Season Dashboard</h1>
            <p className="text-slate-400 mt-1">Your studio's full award history, by season.</p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Trophy,    label: "Total Wins",         value: totalWins,         color: "text-yellow-400" },
            { icon: Star,      label: "Nominations",        value: totalNominations,  color: "text-violet-400" },
            { icon: TrendingUp,label: "Win Rate",           value: `${winRate}%`,     color: "text-emerald-400" },
            { icon: Medal,     label: "Hall of Fame Films", value: hallOfFame.length, color: "text-sky-400"    },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-[#111827] border border-slate-800 rounded-2xl p-5 flex flex-col gap-2">
              <Icon className={`${color} w-6 h-6`} />
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-slate-400 text-sm">{label}</p>
            </div>
          ))}
        </div>

        {/* Hall of Fame */}
        {hallOfFame.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="text-yellow-400 w-5 h-5" /> Hall of Fame
            </h2>
            <div className="flex flex-wrap gap-3">
              {hallOfFame.map((award, i) => (
                <span
                  key={i}
                  className="bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 px-4 py-2 rounded-full text-sm font-semibold"
                >
                  🎬 {award.movieTitle}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Season-by-Season Breakdown */}
        {awards.length === 0 ? (
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-12 text-center">
            <Trophy className="text-slate-600 w-16 h-16 mx-auto mb-4" />
            <h2 className="text-xl text-slate-400">No awards yet.</h2>
            <p className="text-slate-500 mt-2">Keep producing blockbuster movies to earn nominations and wins!</p>
          </div>
        ) : (
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-white">Season History</h2>
            {byYear.map(([year, { nominations, wins }]) => (
              <div key={year} className="bg-[#111827] border border-slate-800 rounded-2xl p-6 space-y-4">
                {/* Season Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Season {year}</h3>
                  <div className="flex gap-3 text-sm">
                    <span className="bg-yellow-400/10 text-yellow-300 px-3 py-1 rounded-full font-semibold border border-yellow-400/20">
                      {wins.length} Win{wins.length !== 1 ? "s" : ""}
                    </span>
                    <span className="bg-violet-400/10 text-violet-300 px-3 py-1 rounded-full font-semibold border border-violet-400/20">
                      {nominations.length} Nomination{nominations.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {/* Wins */}
                {wins.length > 0 && (
                  <div>
                    <p className="text-yellow-400 text-xs font-bold uppercase tracking-widest mb-2">Wins</p>
                    <div className="flex flex-wrap gap-2">
                      {wins.map((w, i) => (
                        <span
                          key={i}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getCategoryStyle(w.category)}`}
                        >
                          🏆 {w.category}{w.movieTitle ? ` — ${w.movieTitle}` : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Nominations */}
                {nominations.length > 0 && (
                  <div>
                    <p className="text-violet-400 text-xs font-bold uppercase tracking-widest mb-2">Nominations</p>
                    <div className="flex flex-wrap gap-2">
                      {nominations.map((n, i) => (
                        <span
                          key={i}
                          className="bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-full text-xs font-semibold"
                        >
                          ⭐ {n.category}{n.movieTitle ? ` — ${n.movieTitle}` : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Link back to Trophy Room */}
        <div className="text-center">
          <Link
            to="/awards/trophy-room"
            className="text-violet-400 hover:text-violet-300 text-sm underline transition"
          >
            View Trophy Room →
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AwardsSeasonDashboard;
