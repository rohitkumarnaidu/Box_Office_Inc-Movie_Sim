import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Newspaper, AlertCircle, TrendingUp, Info } from "lucide-react";
import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";

const NewsDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/news/${id}`);
        setArticle(res.data.newsItem);
      } catch (err) {
        console.error(err);
        setError("Could not retrieve the news article details.");
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  const getTagColor = (type) => {
    switch (type?.toLowerCase()) {
      case "boxoffice":
      case "box office":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "rivalry":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "trend":
      case "trend alert":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <Link to="/news" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition">
          <ArrowLeft size={16} /> Back to News Feed
        </Link>

        {loading ? (
          <div className="text-slate-400 py-12 text-center">Loading article details...</div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl text-red-200 flex items-center gap-3">
            <AlertCircle className="shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-5">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTagColor(article.type)}`}>
                {article.type || "Industry News"}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                <Calendar size={14} /> Week {article.week}
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                {article.title}
              </h1>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Newspaper size={16} className="text-indigo-400" />
                <span>Hollywood Reporter &bull; CineVerse Wire</span>
              </div>
            </div>

            <div className="text-slate-300 leading-relaxed text-base sm:text-lg space-y-4 pt-4 border-t border-slate-800/50">
              <p>{article.content || article.message}</p>
            </div>

            {/* Strategic Studio Insights */}
            <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-5 space-y-3 mt-6">
              <h3 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <Info size={16} className="text-indigo-400" /> Studio Advisor Recommendations
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {article.type?.toLowerCase() === "trend alert"
                  ? "Market dynamics are shifting rapidly. Pivot scripts currently in the PLANNING phase to align with these trends to optimize box office multipliers upon release."
                  : article.type?.toLowerCase() === "rivalry"
                  ? "Ensure your active movies have boosted marketing campaigns to resist rival box office pressure."
                  : "Leverage this momentum. Consider initiating production on new scripts or locking down critical talent while market interest remains high."}
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default NewsDetail;
