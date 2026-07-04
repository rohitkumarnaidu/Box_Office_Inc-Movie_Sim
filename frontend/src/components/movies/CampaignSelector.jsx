import { Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

const MARKETING_CAMPAIGNS = [
  { id: "trailer", name: "Trailer Campaign", cost: 100000, hypeBoost: 8 },
  { id: "teaser", name: "Teaser Campaign", cost: 50000, hypeBoost: 4 },
  { id: "pr", name: "PR Campaign", cost: 200000, hypeBoost: 12 },
  { id: "tv", name: "TV Advertising", cost: 500000, hypeBoost: 25 },
  { id: "newspaper", name: "Newspaper Advertising", cost: 50000, hypeBoost: 3 },
  { id: "digital", name: "Digital Ads", cost: 250000, hypeBoost: 15 },
  { id: "social", name: "Social Media Campaign", cost: 150000, hypeBoost: 10 },
  { id: "influencer", name: "Influencer Campaign", cost: 300000, hypeBoost: 18 },
  { id: "billboards", name: "Billboards", cost: 200000, hypeBoost: 10 },
];

const CampaignSelector = ({ activeCampaigns = [], studioMoney = 0, onLaunchCampaign }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
      <h3 className="text-white font-bold text-base flex items-center gap-2">
        <Sparkles className="text-violet-400" size={18} /> Strategic Marketing Suite
      </h3>
      <p className="text-xs text-slate-400">
        Deploy promotional campaigns during production stages to amplify audience hype before release.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {MARKETING_CAMPAIGNS.map((campaign) => {
          const isActive = activeCampaigns.includes(campaign.id);
          const canAfford = studioMoney >= campaign.cost;

          return (
            <div
              key={campaign.id}
              className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition ${
                isActive
                  ? "bg-violet-950/20 border-violet-500/40 text-violet-300"
                  : "bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <h4 className="text-sm font-bold text-white truncate">{campaign.name}</h4>
                  {isActive && <CheckCircle2 size={16} className="text-violet-400 shrink-0" />}
                </div>
                <div className="flex justify-between items-center text-xs mt-2 text-slate-400">
                  <span>Cost:</span>
                  <span className="font-semibold text-slate-200">₹{campaign.cost.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-slate-850 pt-2 text-xs">
                <span>Hype Boost:</span>
                <span className="font-bold text-violet-400">+{campaign.hypeBoost}</span>
              </div>

              {!isActive && (
                <button
                  onClick={() => onLaunchCampaign(campaign.id)}
                  disabled={!canAfford}
                  className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition cursor-pointer"
                >
                  {canAfford ? "Launch Campaign" : "Insufficient Funds"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CampaignSelector;
