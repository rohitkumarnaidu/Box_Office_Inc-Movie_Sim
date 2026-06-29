import { X, TrendingUp, Star, Bell, Calendar, Swords, Trophy } from "lucide-react";

const VERDICT_COLORS = {
  ALL_TIME_BLOCKBUSTER: { bg: "bg-yellow-500/20",  text: "text-yellow-400",  border: "border-yellow-500/40" },
  LEGENDARY:   { bg: "bg-yellow-500/20",  text: "text-yellow-400",  border: "border-yellow-500/40" },
  BLOCKBUSTER: { bg: "bg-orange-500/20",  text: "text-orange-400",  border: "border-orange-500/40" },
  HIT:         { bg: "bg-green-500/20",   text: "text-green-400",   border: "border-green-500/40"  },
  AVERAGE:     { bg: "bg-slate-500/20",   text: "text-slate-400",   border: "border-slate-500/40"  },
  FLOP:        { bg: "bg-red-500/20",     text: "text-red-400",     border: "border-red-500/40"    },
  DISASTER:    { bg: "bg-red-800/30",     text: "text-red-500",     border: "border-red-700/40"    },
};

const VerdictBadge = ({ verdict }) => {
  const style = VERDICT_COLORS[verdict] || VERDICT_COLORS.AVERAGE;
  return (
    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${style.bg} ${style.text} ${style.border}`}>
      {verdict}
    </span>
  );
};

const SimulationSummaryModal = ({ summary, onClose }) => {
  if (!summary) return null;

  const rivalReleases = summary.rivalReleases || [];
  const hasRivals = rivalReleases.length > 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl bg-[#111827] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
        <div className="bg-linear-to-r from-violet-600 to-indigo-600 p-5 sm:p-8 text-center relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/50 hover:text-white transition cursor-pointer"
          >
            <X size={24} />
          </button>
          <Calendar className="mx-auto text-white mb-2 sm:mb-4" size={40} />
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tighter">Simulation Complete</h2>
          <p className="text-violet-100 font-bold mt-1 text-sm sm:text-base">Week {summary.startWeek} → Week {summary.endWeek}</p>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {/* Stats row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/50 border border-slate-800 p-3 sm:p-5 rounded-2xl text-center">
              <div className="flex justify-center text-green-500 mb-1 sm:mb-2"><TrendingUp size={20} /></div>
              <div className="text-xl sm:text-2xl font-black text-white">+{summary.fansGained?.toLocaleString()}</div>
              <div className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Fans Gained</div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-3 sm:p-5 rounded-2xl text-center">
              <div className="flex justify-center text-yellow-500 mb-1 sm:mb-2"><Star size={20} /></div>
              <div className="text-xl sm:text-2xl font-black text-white">+{summary.prestigeGained?.toLocaleString()}</div>
              <div className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Prestige Gained</div>
            </div>
          </div>

          {/* Rivals this week */}
          {hasRivals && (
            <div>
              <div className="flex items-center gap-2 text-slate-400 font-bold uppercase text-[10px] sm:text-xs tracking-widest mb-3">
                <Swords size={14} className="text-red-400" /> Rivals This Week ({rivalReleases.length} release{rivalReleases.length !== 1 ? "s" : ""})
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                {rivalReleases.map((r, idx) => (
                  <div key={idx} className="bg-slate-900/80 border border-slate-800/50 p-2.5 sm:p-3 rounded-xl flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-white truncate">{r.rivalName}</p>
                      <p className="text-[10px] text-slate-500 truncate">"{r.title}" • {r.genre}</p>
                    </div>
                    <VerdictBadge verdict={r.verdict} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notifications */}
          <div>
            <div className="flex items-center gap-2 text-slate-400 font-bold uppercase text-[10px] sm:text-xs tracking-widest mb-3 sm:mb-4">
              <Bell size={14} /> Recent Notifications ({summary.notificationCount})
            </div>
            <div className="space-y-2 max-h-36 sm:max-h-40 overflow-y-auto pr-2 custom-scrollbar">
              {summary.newNotifications.map((notif, idx) => (
                <div key={idx} className="bg-slate-900/80 border border-slate-800/50 p-2.5 sm:p-3 rounded-xl text-xs sm:text-sm text-slate-300">
                  {notif.message}
                </div>
              ))}
              {summary.newNotifications.length === 0 && (
                <div className="text-slate-600 text-center py-4 italic text-sm">No major events occurred.</div>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 sm:py-4 rounded-2xl font-black text-base sm:text-lg transition shadow-lg shadow-violet-900/20 cursor-pointer"
          >
            CONTINUE
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimulationSummaryModal;

