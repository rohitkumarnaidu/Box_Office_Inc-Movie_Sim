import { CheckCircle2, ShieldAlert, Award, Star, Zap } from "lucide-react";

const UpgradePerkCard = ({ upgrade, isOwned, studioMoney, onBuy }) => {
  const getIcon = (id) => {
    switch (id) {
      case "marketing_partnership":
        return <Award className="text-violet-400" size={24} />;
      case "advanced_cameras":
        return <Zap className="text-amber-400" size={24} />;
      default:
        return <Star className="text-blue-400" size={24} />;
    }
  };

  return (
    <div
      className={`bg-slate-900 border rounded-2xl p-5 hover:border-violet-500/20 transition flex flex-col justify-between space-y-4 ${
        isOwned ? "border-violet-500/40 text-violet-300" : "border-slate-800 text-slate-400"
      }`}
    >
      <div>
        <div className="flex justify-between items-start gap-2 mb-3">
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850">
            {getIcon(upgrade.id)}
          </div>
          {isOwned ? (
            <span className="bg-violet-900/40 border border-violet-750 text-violet-300 px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 shrink-0">
              <CheckCircle2 size={12} /> Owned
            </span>
          ) : (
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Available Perk</span>
          )}
        </div>

        <h3 className="text-white font-bold text-base truncate">{upgrade.name}</h3>
        <p className="text-slate-400 text-xs mt-2 leading-relaxed">{upgrade.description}</p>
      </div>

      <div className="flex justify-between items-center border-t border-slate-850 pt-3 text-xs">
        <span>Upgrade Cost:</span>
        <span className="font-extrabold text-white text-sm">₹{upgrade.cost.toLocaleString()}</span>
      </div>

      {!isOwned && (
        <button
          onClick={() => onBuy(upgrade.id)}
          disabled={studioMoney < upgrade.cost}
          className="w-full bg-violet-600 hover:bg-violet-750 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-2 rounded-xl text-xs transition cursor-pointer"
        >
          {studioMoney >= upgrade.cost ? "Purchase Upgrade" : "Insufficient Funds"}
        </button>
      )}
    </div>
  );
};

export default UpgradePerkCard;
