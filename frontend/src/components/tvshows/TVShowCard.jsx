import { Tv, Sparkles, TrendingUp, DollarSign } from "lucide-react";

const TVShowCard = ({ show }) => {
  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case "IN_PRODUCTION":
        return "bg-violet-900/40 text-violet-300 border-violet-750";
      case "AIRING":
        return "bg-emerald-900/40 text-emerald-300 border-emerald-750";
      case "ENDED":
        return "bg-slate-800 text-slate-300 border-slate-700";
      default:
        return "bg-rose-900/40 text-rose-300 border-rose-750";
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-violet-500/30 transition flex flex-col justify-between space-y-4">
      <div>
        <div className="flex justify-between items-start gap-2 mb-3">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(show.status)}`}>
            {show.status.replace("_", " ")}
          </span>
          <span className="text-xs text-slate-500 font-medium">Created Week {show.createdWeek}</span>
        </div>
        <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2 truncate">
          <Tv size={18} className="text-violet-400 shrink-0" /> {show.title}
        </h3>
        <p className="text-xs text-slate-400">Genre: {show.genre}</p>
      </div>

      <div className="bg-slate-950/60 p-4 rounded-xl space-y-2 text-sm border border-slate-850">
        <div className="flex justify-between text-slate-450">
          <span>Format:</span>
          <span className="text-white font-medium">{show.seasons} Season(s) / {show.episodesPerSeason} Ep.</span>
        </div>
        <div className="flex justify-between text-slate-450">
          <span>Investment:</span>
          <span className="text-white font-medium">₹{show.budget.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center border-t border-slate-850 pt-2 font-bold text-violet-400 text-xs">
          <span className="flex items-center gap-1"><Sparkles size={12} /> Quality:</span>
          <span>{show.quality}/100</span>
        </div>
      </div>
    </div>
  );
};

export default TVShowCard;
