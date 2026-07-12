import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import { DetailSkeleton } from "../../components/common/SkeletonGrid";
import { User, Award, TrendingUp, IndianRupee, Star, ArrowLeft, Calendar, Briefcase } from "lucide-react";

const TalentProfile = () => {
  const { type, id } = useParams(); // /talent/:type/:id
  const [talent, setTalent] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTalent = useCallback(async () => {
    try {
      setLoading(true);
      // Determine endpoint based on type
      let endpoint = "";
      if (type === "writer") endpoint = `/writers/${id}/profile`;
      else if (type === "director") endpoint = `/directors/${id}`;
      else if (type === "actor") endpoint = `/actors/${id}/profile`; // To be implemented or similar

      const res = await api.get(endpoint);
      setTalent(res.data.profile || res.data.director || res.data.actor);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id, type]);

  useEffect(() => {
    fetchTalent();
  }, [fetchTalent]);

  if (loading) return <DashboardLayout><DetailSkeleton title="Loading talent profile..." /></DashboardLayout>;
  if (!talent) return <DashboardLayout><div className="text-white text-center py-20">Talent Not Found</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        <Link to={`/${type}s`} className="flex items-center gap-2 text-slate-400 hover:text-white transition font-bold group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to {type}s
        </Link>

        <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full md:w-64 aspect-square bg-slate-800 rounded-3xl border border-slate-700 flex items-center justify-center text-slate-500 shrink-0">
                <User size={80} />
            </div>

            <div className="flex-1 space-y-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                            talent.rarity === 'LEGENDARY' ? 'bg-orange-600' :
                            talent.rarity === 'EPIC' ? 'bg-purple-600' : 'bg-slate-700'
                        }`}>{talent.rarity}</span>
                        <span className="text-slate-500 font-bold uppercase text-xs">{talent.status}</span>
                    </div>
                    <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter">{talent.name}</h1>
                    <p className="text-slate-400 font-bold mt-2">Age {Math.floor(talent.age)} • {type.toUpperCase()}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#111827] border border-slate-800 p-4 rounded-2xl">
                        <div className="text-slate-500 text-[10px] font-bold uppercase mb-1">Reputation</div>
                        <div className="text-xl font-black text-white">{talent.reputation}/100</div>
                    </div>
                    <div className="bg-[#111827] border border-slate-800 p-4 rounded-2xl">
                        <div className="text-slate-500 text-[10px] font-bold uppercase mb-1">Weekly Salary</div>
                        <div className="text-xl font-black text-violet-400">₹{talent.salary?.toLocaleString()}</div>
                    </div>
                    <div className="bg-[#111827] border border-slate-800 p-4 rounded-2xl">
                        <div className="text-slate-500 text-[10px] font-bold uppercase mb-1">Career Earnings</div>
                        <div className="text-xl font-black text-green-500">₹{talent.careerEarnings?.toLocaleString() || 0}</div>
                    </div>
                    <div className="bg-[#111827] border border-slate-800 p-4 rounded-2xl">
                        <div className="text-slate-500 text-[10px] font-bold uppercase mb-1">Awards</div>
                        <div className="text-xl font-black text-yellow-500">{talent.awards || 0}</div>
                    </div>
                </div>
            </div>
        </div>

        {/* History */}
        <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 space-y-6">
            <h3 className="text-xl font-bold text-white uppercase italic border-b border-slate-800 pb-4">Career History</h3>
            <div className="space-y-4">
                {(talent.careerHistory || []).length === 0 ? (
                    <div className="text-slate-600 italic">No project history found for this talent.</div>
                ) : (
                    talent.careerHistory.map((entry, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                            <div>
                                <div className="text-white font-bold">{entry.movieTitle || entry.scriptName}</div>
                                <div className="text-slate-500 text-xs uppercase font-bold">Week {entry.releaseWeek || entry.completionWeek}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-violet-400 font-black uppercase text-xs">{entry.verdict || 'COMPLETED'}</div>
                                <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{entry.boxOffice ? `₹${entry.boxOffice.toLocaleString()}` : ''}</div>
                            </div>
                        </div>
                    )).reverse()
                )}
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TalentProfile;
