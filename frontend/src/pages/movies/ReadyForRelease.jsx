import { useCallback, useEffect, useState } from "react";
import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import { Film, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ReadyForRelease = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/movies/active");
      const ready = (res.data.movies || []).filter(m => m.status === "READY_FOR_RELEASE");
      setMovies(ready);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const handleRelease = async (id) => {
    if (loading) return;
    try {
      setLoading(true);
      const res = await api.post(`/movies/${id}/release`);
      navigate(`/movies/${id}/results`, { state: { movie: res.data.movie, growth: res.data.growth } });
    } catch (error) {
      alert(error?.response?.data?.message || "Release failed");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-white">Ready for Release</h1>
          <p className="text-slate-400 mt-2">These movies have finished post-production. It's time for the world to see them!</p>
        </div>

        {loading ? (
          <div className="text-white text-center py-10">Loading...</div>
        ) : movies.length === 0 ? (
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            No movies are ready for release yet. Complete production first!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {movies.map((movie) => (
              <div key={movie._id} className="bg-[#111827] border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-2xl font-bold text-white">{movie.title}</h3>
                  <div className="bg-green-500/20 text-green-500 px-3 py-1 rounded-lg text-xs font-bold uppercase">Ready</div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-slate-400 text-xs uppercase tracking-wider">Quality: <span className="text-white font-bold">{movie.quality}</span></div>
                  <div className="text-slate-400 text-xs uppercase tracking-wider">Hype: <span className="text-white font-bold">{movie.hype}</span></div>
                  <div className="text-slate-400 text-xs uppercase tracking-wider">Budget: <span className="text-white font-bold">₹{((movie.budget || 0) + (movie.marketingBudget || 0)).toLocaleString()}</span></div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    disabled={loading}
                    onClick={() => handleRelease(movie._id)}
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    {loading ? "Releasing..." : <><Play size={18} /> Release Theatrically</>}
                  </button>
                  
                  <button
                    disabled={loading}
                    onClick={() => navigate(`/movies/${movie._id}/streaming-deals`)}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-blue-400 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    View Streaming Offers
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ReadyForRelease;
