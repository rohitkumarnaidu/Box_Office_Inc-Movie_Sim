import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, Heart, Award, AlertCircle } from "lucide-react";
import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import ReviewQuoteList from "../../components/movies/ReviewQuoteList";

const ReviewDashboard = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/reviews/${id}`);
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch review data");
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [id]);

  const getVerdictBadge = (verdict) => {
    switch (verdict?.toUpperCase()) {
      case "BLOCKBUSTER":
      case "ALL-TIME BLOCKBUSTER":
        return "bg-purple-600 text-white border-purple-500";
      case "HIT":
        return "bg-green-600 text-white border-green-500";
      case "AVERAGE":
        return "bg-slate-650 text-slate-200 border-slate-600";
      default:
        return "bg-red-600 text-white border-red-500";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <Link to="/movies/library" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition">
          <ArrowLeft size={16} /> Back to Movie Library
        </Link>

        {loading ? (
          <div className="text-slate-400 py-12 text-center">Loading movie reviews...</div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl text-red-200 flex items-center gap-3">
            <AlertCircle className="shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header / Summary */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-white">{data.title}</h1>
                <div className="flex items-center gap-3 mt-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getVerdictBadge(data.verdict)}`}>
                    {data.verdict}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Released film</span>
                </div>
              </div>
              
              {/* Ratings */}
              <div className="flex gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-center min-w-[110px]">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                    <Star size={12} className="text-amber-400 fill-amber-400" /> Critic Score
                  </p>
                  <p className="text-3xl font-black text-white mt-1">{data.criticScore}/100</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-center min-w-[110px]">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                    <Heart size={12} className="text-rose-500 fill-rose-500" /> Audience
                  </p>
                  <p className="text-3xl font-black text-white mt-1">{data.audienceScore}%</p>
                </div>
              </div>
            </div>

            {/* Quotes Breakdown */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <h2 className="text-lg font-bold text-white uppercase italic flex items-center gap-2">
                <Award className="text-violet-500" /> Critic Review Quotes
              </h2>
              <ReviewQuoteList quotes={data.quotes} />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ReviewDashboard;
