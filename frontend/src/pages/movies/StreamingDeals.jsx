import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import { Tv, IndianRupee, CheckCircle, ArrowLeft } from "lucide-react";

const StreamingDeals = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [movieRes, platRes] = await Promise.all([
          api.get(`/movies/${id}`),
          api.get("/streaming/platforms")
        ]);
        setMovie(movieRes.data.movie);
        setPlatforms(platRes.data.platforms);
      } catch (error) {
        console.error("Failed to fetch streaming deals data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAcceptDeal = async () => {
    if (accepting) return;
    try {
      setAccepting(true);
      await api.post(`/streaming/movies/${id}/accept-deal`);
      navigate(`/movies/library`);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to accept deal");
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh] text-white font-bold">
          Negotiating with Platforms...
        </div>
      </DashboardLayout>
    );
  }

  if (!movie || !movie.streamingDeal || movie.streamingDeal.status !== "OFFERED") {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto py-12 text-center text-white">
          <h1 className="text-3xl font-bold mb-4">No Active Offers</h1>
          <p className="text-slate-400 mb-6">There are no active streaming offers for this movie, or it has already been released.</p>
          <button onClick={() => navigate(-1)} className="bg-slate-800 px-6 py-2 rounded-xl">Go Back</button>
        </div>
      </DashboardLayout>
    );
  }

  const platform = platforms.find(p => p.id === movie.streamingDeal.platformId);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white flex items-center gap-2 mb-6">
          <ArrowLeft size={16} /> Back to Release Screen
        </button>

        <div>
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <Tv className="text-blue-500" size={36} /> Streaming Offers
          </h1>
          <p className="text-slate-400 mt-2">Bypass theatrical risk and secure guaranteed profit by selling exclusive rights.</p>
        </div>

        <div className="bg-[#111827] border border-blue-900/50 rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

          <div className="flex items-center gap-4 mb-6">
             <div className="w-16 h-16 bg-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/30">
               <Tv size={32} className="text-blue-400" />
             </div>
             <div>
               <h2 className="text-2xl font-black text-white">{platform?.name || "Streaming Platform"}</h2>
               <p className="text-blue-400 font-bold uppercase text-xs tracking-wider">Exclusive Rights Offer</p>
             </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-bold text-white mb-4">Deal Details for "{movie.title}"</h3>
            
            <div className="grid grid-cols-2 gap-6">
               <div>
                  <p className="text-slate-500 text-sm mb-1 uppercase font-bold">Upfront Payment</p>
                  <p className="text-3xl font-black text-green-400 flex items-center">
                    <IndianRupee size={24} className="mr-1" />
                    {(movie.streamingDeal.dealValue / 1000000).toFixed(2)}M
                  </p>
               </div>
               <div>
                  <p className="text-slate-500 text-sm mb-1 uppercase font-bold">Production Budget</p>
                  <p className="text-xl font-bold text-slate-300">
                    ₹{(movie.budget / 1000000).toFixed(2)}M
                  </p>
               </div>
               <div>
                  <p className="text-slate-500 text-sm mb-1 uppercase font-bold">Guaranteed Profit</p>
                  <p className="text-xl font-bold text-green-500">
                    ₹{((movie.streamingDeal.dealValue - movie.budget) / 1000000).toFixed(2)}M
                  </p>
               </div>
               <div>
                  <p className="text-slate-500 text-sm mb-1 uppercase font-bold">Exclusivity Window</p>
                  <p className="text-xl font-bold text-slate-300">
                    {movie.streamingDeal.exclusiveWeeks} Weeks (Lifetime)
                  </p>
               </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
             <button 
               onClick={handleAcceptDeal}
               disabled={accepting}
               className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
             >
               {accepting ? "Signing Contract..." : <><CheckCircle size={20} /> Accept Deal & Sell Rights</>}
             </button>
             <p className="text-center text-xs text-slate-500">
               Accepting this deal cancels any theatrical release plans. The movie will immediately be available to {platform?.name || "platform"} subscribers.
             </p>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default StreamingDeals;
