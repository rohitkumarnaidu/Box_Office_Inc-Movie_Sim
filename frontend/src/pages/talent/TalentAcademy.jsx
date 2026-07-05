import { useEffect, useState } from "react";
import { GraduationCap, Award, AlertCircle, Sparkles, UserCheck } from "lucide-react";
import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import AcademyBootcampSelector from "../../components/talent/AcademyBootcampSelector";

const TalentAcademy = () => {
  const [actors, setActors] = useState([]);
  const [directors, setDirectors] = useState([]);
  const [studioMoney, setStudioMoney] = useState(0);
  const [selectedTalent, setSelectedTalent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const actRes = await api.get("/actors/owned");
      setActors(actRes.data.actors || []);

      const dirRes = await api.get("/directors/owned");
      setDirectors(dirRes.data.directors || []);

      const meRes = await api.get("/auth/me");
      setStudioMoney(meRes.data.user?.studio?.money || 0);

      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to retrieve talent roster details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEnroll = async (bootcampId) => {
    if (!selectedTalent) return;
    try {
      const res = await api.post("/academy/train", {
        talentId: selectedTalent.id,
        talentType: selectedTalent.type,
        bootcampId
      });
      alert(res.data.message);
      
      // Update selected talent state to preview new stats immediately
      setSelectedTalent({
        ...selectedTalent,
        ...res.data.talent
      });
      
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to enroll in bootcamp");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl">
        
        {/* Header banner */}
        <div className="bg-linear-to-r from-violet-850 to-indigo-700 p-6 sm:p-8 rounded-3xl text-white flex justify-between items-center shadow-lg">
          <div>
            <h1 className="text-3xl font-extrabold flex items-center gap-2">
              <GraduationCap /> Talent Training Academy
            </h1>
            <p className="text-violet-100 mt-2 text-sm sm:text-base">
              Send your contracted directors and actors to specialized bootcamps to upgrade their skills and market value.
            </p>
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-xl text-right">
            <p className="text-xs text-violet-200 uppercase font-black">Studio Budget</p>
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
          <div className="text-slate-400 py-12 text-center">Loading academy roster...</div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Roster list */}
            <div className="lg:col-span-1 bg-[#111827] border border-slate-800 rounded-2xl p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <h2 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck size={16} className="text-violet-400" /> Contracted Talent
              </h2>

              <div className="space-y-3">
                {directors.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedTalent({ ...d, type: "director" })}
                    className={`w-full text-left p-3 rounded-xl border transition flex flex-col justify-between ${
                      selectedTalent?.id === d.id
                        ? "bg-violet-950/20 border-violet-500 text-violet-200"
                        : "bg-slate-900/50 border-slate-850 text-slate-400 hover:border-slate-750"
                    }`}
                  >
                    <span className="text-white font-bold text-sm truncate">{d.name}</span>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase mt-1">Director (Lvl {d.reputation / 10})</span>
                  </button>
                ))}

                {actors.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setSelectedTalent({ ...a, type: "actor" })}
                    className={`w-full text-left p-3 rounded-xl border transition flex flex-col justify-between ${
                      selectedTalent?.id === a.id
                        ? "bg-violet-950/20 border-violet-500 text-violet-200"
                        : "bg-slate-900/50 border-slate-850 text-slate-400 hover:border-slate-750"
                    }`}
                  >
                    <span className="text-white font-bold text-sm truncate">{a.name}</span>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase mt-1">Actor (Lvl {a.popularity / 10})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Program details & selector */}
            <div className="lg:col-span-2 space-y-6">
              {selectedTalent ? (
                <div className="space-y-6">
                  {/* Talent Overview Cards */}
                  <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 flex justify-between items-center">
                    <div>
                      <h2 className="text-white font-black text-xl">{selectedTalent.name}</h2>
                      <p className="text-xs text-slate-500 uppercase font-bold mt-1 tracking-wider">{selectedTalent.type}</p>
                    </div>

                    <div className="flex gap-4">
                      {selectedTalent.type === "actor" ? (
                        <>
                          <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-850 text-center min-w-[90px]">
                            <p className="text-[10px] text-slate-500 font-bold uppercase">Acting</p>
                            <p className="text-lg font-black text-violet-400 mt-0.5">{selectedTalent.actingSkill}/100</p>
                          </div>
                          <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-850 text-center min-w-[90px]">
                            <p className="text-[10px] text-slate-500 font-bold uppercase">Popularity</p>
                            <p className="text-lg font-black text-violet-400 mt-0.5">{selectedTalent.popularity}/100</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-850 text-center min-w-[90px]">
                            <p className="text-[10px] text-slate-500 font-bold uppercase">Creativity</p>
                            <p className="text-lg font-black text-violet-400 mt-0.5">{selectedTalent.creativity}/100</p>
                          </div>
                          <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-850 text-center min-w-[90px]">
                            <p className="text-[10px] text-slate-500 font-bold uppercase">Leadership</p>
                            <p className="text-lg font-black text-violet-400 mt-0.5">{selectedTalent.leadership}/100</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Bootcamp selector */}
                  <AcademyBootcampSelector
                    selectedTalentType={selectedTalent.type}
                    studioMoney={studioMoney}
                    onEnroll={handleEnroll}
                  />
                </div>
              ) : (
                <div className="bg-[#111827] border border-slate-800 rounded-2xl p-10 text-center text-slate-500">
                  Select a contracted director or actor from the roster to customize their training program.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TalentAcademy;
