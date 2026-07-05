import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Tv, Plus, AlertCircle } from "lucide-react";
import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import TVShowCard from "../../components/tvshows/TVShowCard";

const TVShowsHub = () => {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchShows = async () => {
    try {
      setLoading(true);
      const res = await api.get("/tv-shows");
      setShows(res.data.tvShows || []);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch television shows.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShows();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-linear-to-r from-indigo-700 to-violet-500 p-6 sm:p-8 rounded-3xl text-white">
          <div>
            <h1 className="text-3xl font-extrabold flex items-center gap-2">
              <Tv /> TV Production Hub
            </h1>
            <p className="text-indigo-100 mt-2 text-sm sm:text-base">
              Produce television series, seasons, and episodes alongside your blockbuster cinema slate.
            </p>
          </div>
          <Link
            to="/tv-shows/commission"
            className="bg-white hover:bg-slate-100 text-indigo-700 font-bold py-3 px-5 rounded-xl transition flex items-center gap-2 text-sm cursor-pointer shadow-lg"
          >
            <Plus size={16} /> Commission Show
          </Link>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl text-red-200 flex items-center gap-3">
            <AlertCircle className="shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-slate-400 py-12 text-center">Loading television active slates...</div>
        ) : (
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
            {shows.length === 0 ? (
              <div className="text-slate-500 py-12 text-center">
                No television series produced yet. Click the button above to commission your studio's first show!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shows.map((show) => (
                  <TVShowCard key={show._id} show={show} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TVShowsHub;
