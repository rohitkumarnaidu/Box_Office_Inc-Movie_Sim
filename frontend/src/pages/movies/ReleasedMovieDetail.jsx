import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import { Film, Calendar, Users, Briefcase, IndianRupee, Clock, ArrowLeft, Star, TrendingUp, Award } from "lucide-react";

const ReleasedMovieDetail = () => {
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

  if (loading) return <DashboardLayout><div className="text-white text-center py-20 font-bold tracking-widest uppercase">Loading Historical Archive...</div></DashboardLayout>;
  if (!movie) return <DashboardLayout><div className="text-white text-center py-20 font-bold">Movie Record Not Found</div></DashboardLayout>;

  const getVerdictColor = (verdict) => {
    switch(verdict) {
        case 'ALL_TIME_BLOCKBUSTER':
        case 'LEGENDARY': return 'bg-orange-600';
        case 'BLOCKBUSTER': return 'bg-purple-600';
        case 'HIT': return 'bg-green-600';
        case 'AVERAGE': return 'bg-slate-600';
        case 'FLOP': return 'bg-red-600';
        case 'DISASTER': return 'bg-red-900';
        default: return 'bg-slate-700';
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        <Link to="/movies/library" className="flex items-center gap-2 text-slate-400 hover:text-white transition font-bold group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Library
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-4 flex-1">
            <div className={`inline-block px-4 py-1 rounded-full text-white text-[10px] font-black tracking-widest uppercase mb-2 ${getVerdictColor(movie.verdict)}`}>
                {movie.verdict}
            </div>
            <h1 className="text-6xl font-black text-white uppercase italic tracking-tighter leading-none">{movie.title}</h1>
            <div className="flex items-center gap-4 text-slate-400 font-bold">
                <span className="flex items-center gap-1"><Calendar size={16} /> Released Week {movie.releaseWeek}</span>
                <span className="flex items-center gap-1"><Star size={16} className="text-yellow-500" /> Audience: {movie.audienceScore}</span>
                <span className="flex items-center gap-1"><Award size={16} className="text-violet-500" /> Critic: {movie.criticScore}</span>
            </div>
          </div>
          <div className="bg-[#111827] border border-slate-800 p-6 rounded-3xl text-right min-w-[250px]">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Total Profit</div>
            <div className={`text-4xl font-black ${(movie.profit + (movie.merchandiseRevenue || 0)) >= 0 ? 'text-green-500' : 'text-red-500'}`}>₹{(movie.profit + (movie.merchandiseRevenue || 0))?.toLocaleString()}</div>
            <div className="text-slate-400 text-sm font-bold mt-1">{(movie.roi * 100).toFixed(1)}% ROI</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
            {/* Box Office / Deal Cards */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 space-y-6">
                    <h3 className="text-xl font-bold text-white uppercase italic flex items-center gap-2 border-b border-slate-800 pb-4">
                        <TrendingUp className="text-violet-500" /> {movie.releaseType === 'STREAMING' ? 'Streaming Deal' : 'Box Office'}
                    </h3>
                    {movie.releaseType === 'STREAMING' ? (
                      <div className="space-y-6">
                          <div>
                              <div className="text-slate-500 text-[10px] font-bold uppercase mb-1">Platform ID</div>
                              <div className="text-2xl font-bold text-white uppercase">{movie.streamingDeal?.platformId}</div>
                          </div>
                          <div>
                              <div className="text-slate-500 text-[10px] font-bold uppercase mb-1">Exclusivity</div>
                              <div className="text-2xl font-bold text-white">{movie.streamingDeal?.exclusiveWeeks} Weeks</div>
                          </div>
                          <div className="pt-4 border-t border-slate-800">
                              <div className="text-slate-500 text-[10px] font-bold uppercase mb-1">Deal Value</div>
                              <div className="text-3xl font-black text-blue-400">₹{movie.streamingDeal?.dealValue?.toLocaleString()}</div>
                          </div>
                          {movie.merchandiseRevenue > 0 && (
                              <div className="pt-4 border-t border-slate-800">
                                  <div className="text-slate-500 text-[10px] font-bold uppercase mb-1 text-orange-500">Merchandise & Licensing</div>
                                  <div className="text-3xl font-black text-orange-400">+ ₹{movie.merchandiseRevenue?.toLocaleString()}</div>
                              </div>
                          )}
                      </div>
                    ) : (
                      <div className="space-y-6">
                          <div>
                              <div className="text-slate-500 text-[10px] font-bold uppercase mb-1">Opening Weekend</div>
                              <div className="text-2xl font-bold text-white">₹{movie.openingWeekend?.toLocaleString()}</div>
                          </div>
                          <div>
                              <div className="text-slate-500 text-[10px] font-bold uppercase mb-1">Domestic Gross</div>
                              <div className="text-2xl font-bold text-white">₹{movie.domesticGross?.toLocaleString()}</div>
                          </div>
                          <div>
                              <div className="text-slate-500 text-[10px] font-bold uppercase mb-1">International Gross</div>
                              <div className="text-2xl font-bold text-white">₹{movie.internationalGross?.toLocaleString()}</div>
                          </div>
                          <div className="pt-4 border-t border-slate-800">
                              <div className="text-slate-500 text-[10px] font-bold uppercase mb-1">Worldwide Gross</div>
                              <div className="text-3xl font-black text-violet-400">₹{movie.worldwideGross?.toLocaleString()}</div>
                          </div>
                          {movie.merchandiseRevenue > 0 && (
                              <div className="pt-4 border-t border-slate-800">
                                  <div className="text-slate-500 text-[10px] font-bold uppercase mb-1 text-orange-500">Merchandise & Licensing</div>
                                  <div className="text-3xl font-black text-orange-400">+ ₹{movie.merchandiseRevenue?.toLocaleString()}</div>
                              </div>
                          )}
                      </div>
                    )}
                </div>
            </div>

            {/* Personnel & Details */}
            <div className="lg:col-span-2 space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 space-y-6">
                        <h3 className="text-lg font-bold text-white uppercase italic border-b border-slate-800 pb-4 flex items-center gap-2">
                            <Users size={18} className="text-blue-500" /> Talent Involved
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 text-sm">Director</span>
                                <span className="text-white font-bold">{movie.directorName || movie.directorId}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 text-sm">Lead Actor</span>
                                <span className="text-white font-bold">{movie.leadActorName || movie.leadActorId}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 text-sm">Crew Team</span>
                                <span className="text-white font-bold">{movie.crewTeamName || movie.crewTeamId}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 space-y-6">
                        <h3 className="text-lg font-bold text-white uppercase italic border-b border-slate-800 pb-4 flex items-center gap-2">
                            <IndianRupee size={18} className="text-green-500" /> Investment
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 text-sm">Production Budget</span>
                                <span className="text-white font-bold">₹{movie.budget?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 text-sm">Marketing Budget</span>
                                <span className="text-white font-bold">₹{movie.marketingBudget?.toLocaleString()}</span>
                            </div>
                            <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                                <span className="text-slate-400 font-bold uppercase text-xs">Total Spent</span>
                                <span className="text-white font-black">₹{((movie.budget || 0) + (movie.marketingBudget || 0)).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Formula Stats */}
                <div className="bg-linear-to-r from-slate-900 to-[#111827] border border-slate-800 rounded-3xl p-8 flex justify-around text-center">
                    <div>
                        <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Final Quality</div>
                        <div className="text-4xl font-black text-white">{movie.quality}</div>
                    </div>
                    <div className="border-l border-slate-800 h-12 self-center"></div>
                    <div>
                        <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Final Hype</div>
                        <div className="text-4xl font-black text-white">{movie.hype}</div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReleasedMovieDetail;
