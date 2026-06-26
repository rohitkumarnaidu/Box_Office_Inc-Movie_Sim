import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import { Film, Calendar, Users, Briefcase, IndianRupee, Clock, ArrowLeft, CheckCircle2 } from "lucide-react";

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMovieDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/movies/${id}`);
      setMovie(res.data.movie);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMovieDetails();
  }, [fetchMovieDetails]);

  if (loading) return <DashboardLayout><div className="text-white text-center py-20 font-bold">Loading Production Data...</div></DashboardLayout>;
  if (!movie) return <DashboardLayout><div className="text-white text-center py-20 font-bold">Movie Not Found</div></DashboardLayout>;

  const stages = [
    { id: "PRE_PRODUCTION", label: "Pre-Production", duration: 4 },
    { id: "PRODUCTION", label: "Production", duration: 10 },
    { id: "POST_PRODUCTION", label: "Post-Production", duration: 6 },
    { id: "READY_FOR_RELEASE", label: "Ready", duration: 0 }
  ];

  const currentStageIdx = stages.findIndex(s => s.id === movie.status);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        <Link to="/movies" className="flex items-center gap-2 text-slate-400 hover:text-white transition font-bold group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Productions
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter italic">{movie.title}</h1>
            <div className="flex items-center gap-3 mt-2">
                <span className="bg-violet-600 text-white px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest">{movie.status.replace('_', ' ')}</span>
                <span className="text-slate-500 font-bold text-sm">Created Week {movie.createdWeek}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">Total Budget</div>
            <div className="text-3xl font-black text-white">₹{movie.budget?.toLocaleString()}</div>
          </div>
        </div>

        {/* Timeline Visualization */}
        <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 space-y-8">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white uppercase italic flex items-center gap-2">
                    <Clock className="text-violet-500" /> Production Timeline
                </h3>
                <div className="text-violet-400 font-black">{movie.remainingWeeks} WEEKS REMAINING</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                {stages.map((stage, idx) => {
                    const isCompleted = idx < currentStageIdx || movie.status === "RELEASED";
                    const isCurrent = idx === currentStageIdx;

                    return (
                        <div key={stage.id} className="relative z-10">
                            <div className={`p-5 rounded-2xl border transition-all ${
                                isCurrent ? 'bg-violet-600/10 border-violet-500 ring-2 ring-violet-500/20' :
                                isCompleted ? 'bg-green-500/5 border-green-500/30' : 'bg-slate-900/50 border-slate-800'
                            }`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div className={`text-[10px] font-black uppercase tracking-widest ${
                                        isCurrent ? 'text-violet-400' : isCompleted ? 'text-green-500' : 'text-slate-500'
                                    }`}>
                                        {stage.label}
                                    </div>
                                    {isCompleted && <CheckCircle2 size={16} className="text-green-500" />}
                                </div>
                                <div className="text-white font-bold">{stage.duration > 0 ? `${stage.duration} Weeks` : 'Complete'}</div>
                                {isCurrent && (
                                    <div className="mt-3 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="bg-violet-500 h-full transition-all duration-1000"
                                            style={{ width: `${(movie.weeksInStage / stage.duration) * 100}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
            {/* Team */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 space-y-6">
                    <h3 className="text-lg font-bold text-white uppercase italic border-b border-slate-800 pb-4">Key Personnel</h3>

                    <div className="flex items-center gap-4">
                        <div className="bg-slate-800 p-3 rounded-xl"><Calendar className="text-violet-400" /></div>
                        <div>
                            <div className="text-slate-500 text-[10px] font-bold uppercase">Director</div>
                            <div className="text-white font-bold">{movie.directorName || movie.directorId}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="bg-slate-800 p-3 rounded-xl"><Users className="text-blue-400" /></div>
                        <div>
                            <div className="text-slate-500 text-[10px] font-bold uppercase">Lead Actor</div>
                            <div className="text-white font-bold">{movie.leadActorName || movie.leadActorId}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="bg-slate-800 p-3 rounded-xl"><Briefcase className="text-emerald-400" /></div>
                        <div>
                            <div className="text-slate-500 text-[10px] font-bold uppercase">Crew Team</div>
                            <div className="text-white font-bold">{movie.crewTeamName || movie.crewTeamId}</div>
                        </div>
                    </div>
                </div>

                <div className="bg-linear-to-b from-slate-900 to-[#111827] border border-slate-800 rounded-3xl p-6 text-center space-y-2">
                    <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Projected Quality</div>
                    <div className="text-5xl font-black text-white">{movie.quality}</div>
                    <div className="text-violet-400 font-bold uppercase text-xs">Hype: {movie.hype}</div>
                </div>
            </div>

            {/* Budget Breakdown */}
            <div className="lg:col-span-2">
                <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 space-y-6">
                    <h3 className="text-xl font-bold text-white uppercase italic flex items-center gap-2">
                        <IndianRupee className="text-green-500" /> Budget Breakdown
                    </h3>

                    <div className="space-y-4">
                        {[
                            { label: "Script Purchase", value: movie.budgetBreakdown?.scriptCost },
                            { label: "Director Salary (20w)", value: movie.budgetBreakdown?.directorCost },
                            { label: "Lead Actor Salary (20w)", value: movie.budgetBreakdown?.leadActorCost },
                            { label: "Supporting Cast (20w)", value: movie.budgetBreakdown?.supportingActorCost },
                            { label: "Crew & Tech (20w)", value: movie.budgetBreakdown?.crewCost },
                            { label: "Marketing Campaigns", value: movie.budgetBreakdown?.marketingCost },
                        ].map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center py-3 border-b border-slate-800/50">
                                <span className="text-slate-400 font-medium">{item.label}</span>
                                <span className="text-white font-bold">₹{item.value?.toLocaleString()}</span>
                            </div>
                        ))}

                        <div className="flex justify-between items-center pt-4 mt-4">
                            <span className="text-white font-black uppercase tracking-widest">Total Investment</span>
                            <span className="text-3xl font-black text-green-500">₹{movie.budget?.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MovieDetails;
