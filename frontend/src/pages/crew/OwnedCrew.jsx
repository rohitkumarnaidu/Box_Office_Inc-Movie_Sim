import { useCallback, useEffect, useState } from "react";
import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import { Briefcase } from "lucide-react";
import SkeletonGrid from "../../components/common/SkeletonGrid";

const OwnedCrew = () => {
  const [crewTeams, setCrewTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOwnedCrew = useCallback(async (showSkeleton = true) => {
    try {
      if (showSkeleton) {
        setLoading(true);
      }

      const res = await api.get("/crew/owned");
      setCrewTeams(res.data.crewTeams || []);
    } catch (error) {
      console.error(error);
    } finally {
      if (showSkeleton) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const refreshTimer = window.setTimeout(fetchOwnedCrew, 0);

    return () => window.clearTimeout(refreshTimer);
  }, [fetchOwnedCrew]);

  const handleFire = async (id) => {
    if (!window.confirm("Are you sure you want to fire this crew team?")) return;
    if (loading || actionLoading) return;

    try {
      setActionLoading(true);
      await api.post(`/crew/fire/${id}`);
      await fetchOwnedCrew(false);
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to fire crew team");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-white">Your Crew Teams</h1>
          <p className="text-slate-400 mt-2">Manage your production units.</p>
        </div>

        {loading ? (
          <SkeletonGrid variant="compact" />
        ) : crewTeams.length === 0 ? (
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-12 text-center">
                <Briefcase size={48} className="text-slate-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">No Hired Crew</h2>
                <p className="text-slate-400">Hire crew teams from the market to start productions.</p>
            </div>
        ) : (
          <div className={`grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 ${actionLoading ? "pointer-events-none opacity-70" : ""}`}>
            {crewTeams.map((crew) => (
              <div key={crew.id} className="bg-[#111827] border border-slate-800 rounded-2xl p-6 hover:border-violet-600 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white">{crew.name}</h3>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                    crew.status === 'AVAILABLE' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                  }`}>
                    {crew.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div className="text-slate-400">Technical: <span className="text-white">{crew.technicalQuality}</span></div>
                  <div className="text-slate-400">Reliability: <span className="text-white">{crew.reliability}</span></div>
                  <div className="text-slate-400">Morale: <span className="text-white">{crew.morale}</span></div>
                  <div className="text-slate-400">Rarity: <span className="text-white capitalize">{crew.rarity.toLowerCase()}</span></div>
                </div>

                <button
                  disabled={crew.status === 'BUSY' || actionLoading}
                  onClick={() => handleFire(crew.id)}
                  className="w-full bg-slate-800 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? "Processing..." : crew.status === 'BUSY' ? 'Busy on Project' : 'Fire Team'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default OwnedCrew;
