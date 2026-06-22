import { useLocation, Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { Star, TrendingUp, IndianRupee, Users, Award } from "lucide-react";

const ReleaseResult = () => {
  const { state } = useLocation();
  const { movie, growth } = state || {};

  if (!movie) {
    return (
      <DashboardLayout>
        <div className="text-white">No result data found.</div>
      </DashboardLayout>
    );
  }

  const isHit = ["HIT", "BLOCKBUSTER", "ALL_TIME_BLOCKBUSTER", "LEGENDARY"].includes(movie.verdict);
  const isFlop = ["FLOP", "DISASTER"].includes(movie.verdict);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        <div className="text-center space-y-2">
            <h1 className="text-5xl font-black text-white uppercase tracking-tighter italic">World Premiere</h1>
            <p className="text-violet-400 font-bold text-xl">The results for "{movie.title}" are in!</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
            {/* Scores */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 text-center space-y-4">
                    <div className="text-slate-400 font-bold uppercase tracking-widest text-sm">Critic Score</div>
                    <div className={`text-6xl font-black ${movie.criticScore > 60 ? 'text-green-500' : 'text-red-500'}`}>{movie.criticScore}</div>
                    <div className="text-white font-bold text-lg">{movie.criticLabel}</div>
                </div>

                <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 text-center space-y-4">
                    <div className="text-slate-400 font-bold uppercase tracking-widest text-sm">Audience Score</div>
                    <div className={`text-6xl font-black ${movie.audienceScore > 60 ? 'text-yellow-500' : 'text-slate-500'}`}>{movie.audienceScore}</div>
                    <div className="text-white font-bold text-lg">{movie.audienceLabel}</div>
                </div>
            </div>

            {/* Financials & Verdict */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 space-y-8">
                    <div className="flex justify-between items-center">
                        <div className="text-2xl font-bold text-white uppercase italic">Box Office Summary</div>
                        <div className={`px-6 py-2 rounded-full font-black text-xl ${
                            isHit ? 'bg-green-600 text-white' :
                            isFlop ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-200'
                        }`}>
                            {movie.verdict}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <div className="text-slate-400 text-xs uppercase font-bold mb-1">Opening Weekend</div>
                            <div className="text-2xl font-bold text-white">₹{movie.openingWeekend?.toLocaleString()}</div>
                        </div>
                        <div>
                            <div className="text-slate-400 text-xs uppercase font-bold mb-1">Worldwide Gross</div>
                            <div className="text-2xl font-bold text-white">₹{movie.worldwideGross?.toLocaleString()}</div>
                        </div>
                        <div>
                            <div className="text-slate-400 text-xs uppercase font-bold mb-1">Profit / Loss</div>
                            <div className={`text-2xl font-bold ${movie.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                ₹{movie.profit?.toLocaleString()}
                            </div>
                        </div>
                        <div>
                            <div className="text-slate-400 text-xs uppercase font-bold mb-1">ROI</div>
                            <div className="text-2xl font-bold text-white">{(movie.roi * 100).toFixed(1)}%</div>
                        </div>
                    </div>
                </div>

                {/* Studio Gains */}
                <div className="bg-linear-to-r from-violet-900 to-indigo-900 rounded-3xl p-8 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/10 p-3 rounded-2xl"><Users className="text-white" /></div>
                        <div>
                            <div className="text-white/60 text-xs font-bold uppercase">Fans Gained</div>
                            <div className="text-2xl font-black text-white">+{growth?.fanGain?.toLocaleString()}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-white/10 p-3 rounded-2xl"><Award className="text-white" /></div>
                        <div>
                            <div className="text-white/60 text-xs font-bold uppercase">Prestige Gained</div>
                            <div className="text-2xl font-black text-white">+{growth?.prestigeGain?.toLocaleString()}</div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <Link to="/movies/library" className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-center py-4 rounded-2xl font-bold transition">
                        View Library
                    </Link>
                    <Link to="/movies" className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-center py-4 rounded-2xl font-bold transition">
                        Dashboard
                    </Link>
                </div>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReleaseResult;
