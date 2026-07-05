import { X, ShieldAlert, DollarSign, Film, Sparkles, AlertCircle } from "lucide-react";

const SpyReportModal = ({ isOpen, onClose, reportData }) => {
  if (!isOpen || !reportData) return null;

  const { name, personality, money, prestige, fans, level, activeMovies = [], movieHistory = [], stats = {} } = reportData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-gradient-to-r from-red-950/40 to-slate-900">
          <div className="flex items-center gap-2 text-rose-400">
            <ShieldAlert size={22} />
            <h2 className="text-xl font-black uppercase tracking-wider text-white">Espionage Report: {name}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          
          {/* Top overview stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 text-center">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Level</p>
              <p className="text-xl font-extrabold text-white mt-1">{level}</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 text-center">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Cash Reserves</p>
              <p className="text-xl font-extrabold text-green-400 mt-1">₹{money.toLocaleString()}</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 text-center">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Prestige</p>
              <p className="text-xl font-extrabold text-yellow-400 mt-1">{prestige}</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 text-center">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Fans</p>
              <p className="text-xl font-extrabold text-blue-400 mt-1">{fans.toLocaleString()}</p>
            </div>
          </div>

          {/* Active Productions */}
          <div className="space-y-3">
            <h3 className="text-white font-bold flex items-center gap-1.5 text-xs uppercase tracking-widest border-b border-slate-850 pb-2">
              <Film size={14} className="text-violet-400" /> Active Productions
            </h3>
            {activeMovies.length === 0 ? (
              <p className="text-slate-500 text-xs italic">No movies currently in production.</p>
            ) : (
              <div className="space-y-3">
                {activeMovies.map((m, idx) => (
                  <div key={idx} className="bg-slate-950 p-4 rounded-2xl border border-slate-850">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="text-white font-bold text-sm">{m.title}</h4>
                        <p className="text-slate-500 text-xs mt-0.5">{m.genre} • Quality Estimate: <span className="text-violet-400 font-bold">{m.quality}/100</span></p>
                      </div>
                      <span className="text-slate-400 text-xs font-bold bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-850">
                        {m.weeksRemaining}w left
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* History */}
          <div className="space-y-3">
            <h3 className="text-white font-bold flex items-center gap-1.5 text-xs uppercase tracking-widest border-b border-slate-850 pb-2">
              <Sparkles size={14} className="text-yellow-400" /> Release History
            </h3>
            {movieHistory.length === 0 ? (
              <p className="text-slate-500 text-xs italic">No historical release records found.</p>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {movieHistory.map((m, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-850 text-xs">
                    <div>
                      <p className="text-white font-bold">{m.title}</p>
                      <p className="text-slate-500 mt-0.5">{m.genre} • Box Office: ₹{m.boxOffice?.toLocaleString()}</p>
                    </div>
                    <span className="text-amber-400 font-bold uppercase tracking-wider">{m.verdict}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-850 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-6 rounded-xl transition text-xs cursor-pointer"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpyReportModal;
