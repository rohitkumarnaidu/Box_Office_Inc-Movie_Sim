import { useState, useEffect } from "react";
import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import { Link } from "react-router-dom";
import { Film, TrendingUp, IndianRupee, Star, Layers } from "lucide-react";

const Franchises = () => {
  const [franchises, setFranchises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFranchises = async () => {
      try {
        const res = await api.get("/franchises");
        setFranchises(res.data.franchises);
      } catch (error) {
        console.error("Failed to fetch franchises", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFranchises();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh] text-white font-bold">
          Loading Franchises...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <Layers className="text-violet-500" size={36} /> My Franchises
            </h1>
            <p className="text-slate-400 mt-2">Manage your cinematic universes and long-running film series.</p>
          </div>
          <Link
            to="/movies/new"
            className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-xl font-bold transition flex items-center gap-2"
          >
            <Film size={20} />
            Start New Franchise
          </Link>
        </div>

        {franchises.length === 0 ? (
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-12 text-center">
            <Layers className="mx-auto text-slate-600 mb-4" size={48} />
            <h2 className="text-2xl font-bold text-white mb-2">No Franchises Yet</h2>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              You haven't established any franchises. Greenlight a new movie and choose "Start a New Franchise" to begin building your cinematic universe!
            </p>
            <Link
              to="/movies/new"
              className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold transition inline-block"
            >
              Greenlight a Movie
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {franchises.map((franchise) => {
              const numMovies = franchise.movies?.length || 0;
              const totalGross = franchise.movies?.reduce((sum, m) => sum + (m.worldwideGross || 0), 0) || 0;
              const avgQuality = franchise.movies?.reduce((sum, m) => sum + (m.quality || 0), 0) / (numMovies || 1);

              return (
                <div key={franchise._id} className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden hover:border-violet-500/50 transition-all group">
                  <div className="p-6">
                    <h3 className="text-xl font-black text-white mb-1 group-hover:text-violet-400 transition">{franchise.name}</h3>
                    <p className="text-sm text-slate-400 mb-4">Established</p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                        <div className="text-slate-400 text-xs font-bold uppercase mb-1 flex items-center gap-1">
                          <Film size={14} className="text-blue-400" /> Movies
                        </div>
                        <div className="text-white font-bold">{numMovies}</div>
                      </div>
                      <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                        <div className="text-slate-400 text-xs font-bold uppercase mb-1 flex items-center gap-1">
                          <IndianRupee size={14} className="text-green-400" /> Total Box Office
                        </div>
                        <div className="text-white font-bold">{(totalGross / 1000000).toFixed(1)}M</div>
                      </div>
                      <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 col-span-2">
                        <div className="text-slate-400 text-xs font-bold uppercase mb-1 flex items-center gap-1">
                          <Star size={14} className="text-yellow-400" /> Avg. Quality
                        </div>
                        <div className="text-white font-bold">{avgQuality.toFixed(1)} / 100</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-slate-300 uppercase">Installments</h4>
                      {franchise.movies?.slice(0, 3).map((m) => (
                        <div key={m._id} className="flex justify-between items-center text-sm p-2 bg-slate-900 rounded-lg">
                           <span className="text-slate-300 truncate max-w-[150px]">{m.title}</span>
                           <span className={`font-bold ${
                             m.verdict === 'BLOCKBUSTER' || m.verdict === 'LEGENDARY' ? 'text-green-400' :
                             m.verdict === 'HIT' || m.verdict === 'AVERAGE' ? 'text-blue-400' : 'text-red-400'
                           }`}>{m.verdict || "IN PRODUCTION"}</span>
                        </div>
                      ))}
                      {numMovies > 3 && (
                        <div className="text-center text-xs text-slate-500 pt-2">+ {numMovies - 3} more</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Franchises;
