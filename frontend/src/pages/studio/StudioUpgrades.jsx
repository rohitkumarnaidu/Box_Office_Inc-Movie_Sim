import { useEffect, useState } from "react";
import { Sparkles, DollarSign, Award, AlertCircle } from "lucide-react";
import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import UpgradePerkCard from "../../components/studio/UpgradePerkCard";

const StudioUpgrades = () => {
  const [upgrades, setUpgrades] = useState([]);
  const [ownedUpgrades, setOwnedUpgrades] = useState([]);
  const [studioMoney, setStudioMoney] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/upgrades");
      setUpgrades(res.data.available || []);
      setOwnedUpgrades(res.data.purchased || []);
      setStudioMoney(res.data.studioMoney || 0);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load studio upgrade options.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBuyUpgrade = async (upgradeId) => {
    try {
      const res = await api.post("/upgrades/buy", { upgradeId });
      alert(res.data.message);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to purchase upgrade");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl">
        
        {/* Banner */}
        <div className="bg-linear-to-r from-violet-750 to-indigo-700 p-6 sm:p-8 rounded-3xl text-white flex justify-between items-center shadow-lg">
          <div>
            <h1 className="text-3xl font-extrabold flex items-center gap-2">
              <Sparkles className="text-violet-300" /> Studio Upgrades & Perks
            </h1>
            <p className="text-violet-100 mt-2 text-sm sm:text-base">
              Acquire permanent assets, corporate partnerships, and technical upgrades to give your film studio structural benefits.
            </p>
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-xl text-right">
            <p className="text-xs text-violet-200 uppercase font-black font-semibold">Studio Cash</p>
            <p className="text-lg font-black text-white">₹{studioMoney.toLocaleString()}</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl text-red-200 flex items-center gap-3">
            <AlertCircle className="shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-slate-400 py-12 text-center">Loading studio upgrades...</div>
        ) : (
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upgrades.map((upgrade) => (
                <UpgradePerkCard
                  key={upgrade.id}
                  upgrade={upgrade}
                  isOwned={ownedUpgrades.includes(upgrade.id)}
                  studioMoney={studioMoney}
                  onBuy={handleBuyUpgrade}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudioUpgrades;
