import { Sparkles, DollarSign, Award } from "lucide-react";

const CATEGORIES = [
  { id: "Best Picture", name: "Best Picture", cost: 1000000, description: "Submit lobbying packages targeting general Academy voters. Boosts prestige by +15." },
  { id: "Best Director", name: "Best Director", cost: 1000000, description: "Sponsor exclusive roundtables and guild screenings for the director. Boosts prestige by +15." },
  { id: "Best Lead Actor", name: "Best Lead Actor", cost: 1000000, description: "Launch print ads and trade magazine profiles for the lead actor. Boosts prestige by +15." }
];

const LobbyingCategorySelector = ({ activeNominations = [], studioMoney, onEnroll }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
      <h3 className="text-white font-bold text-base flex items-center gap-2">
        <Award className="text-violet-400" size={20} /> Lobbying & Campaign Services
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {CATEGORIES.map((cat) => {
          const isNominated = activeNominations.includes(cat.id);
          const canAfford = studioMoney >= cat.cost;

          return (
            <div
              key={cat.id}
              className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition ${
                isNominated
                  ? "bg-violet-950/20 border-violet-500/40 text-violet-300"
                  : "bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div>
                <h4 className="text-sm font-bold text-white truncate">{cat.name}</h4>
                <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">{cat.description}</p>
              </div>

              <div className="flex justify-between items-center border-t border-slate-850 pt-2 text-xs">
                <span>Lobby Cost:</span>
                <span className="font-bold text-violet-400">₹{cat.cost.toLocaleString()}</span>
              </div>

              {!isNominated ? (
                <button
                  onClick={() => onEnroll(cat.id)}
                  disabled={!canAfford}
                  className="w-full bg-violet-600 hover:bg-violet-750 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition cursor-pointer"
                >
                  {canAfford ? "Launch Campaign" : "Cannot Afford"}
                </button>
              ) : (
                <div className="text-center text-xs text-green-400 font-bold py-1.5 bg-green-500/10 rounded-lg border border-green-500/20">
                  Campaign Running
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LobbyingCategorySelector;
