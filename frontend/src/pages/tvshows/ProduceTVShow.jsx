import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Send, Sparkles, DollarSign } from "lucide-react";
import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";

const ProduceTVShow = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    genre: "Drama",
    seasons: 1,
    episodesPerSeason: 8,
    budget: 5000000
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "seasons" || name === "episodesPerSeason" || name === "budget" ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Please enter a show title.");
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/tv-shows", formData);
      alert("Successfully commissioned new TV Show!");
      navigate("/tv-shows");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to commission TV Show");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <Link to="/tv-shows" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition">
          <ArrowLeft size={16} /> Back to TV Hub
        </Link>

        <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <Sparkles className="text-violet-400" /> Commission New TV Show
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Series Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Stranger Anomalies"
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-white outline-none focus:border-violet-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Genre</label>
                <select
                  name="genre"
                  value={formData.genre}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-white outline-none focus:border-violet-500"
                >
                  {["Drama", "Comedy", "Sci-Fi", "Horror", "Thriller", "Action", "Fantasy"].map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Production Budget (₹)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <DollarSign size={16} />
                  </div>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    min="100000"
                    step="100000"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-9 pr-4 py-3 text-white outline-none focus:border-violet-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Commissioned Seasons</label>
                <input
                  type="number"
                  name="seasons"
                  value={formData.seasons}
                  onChange={handleChange}
                  min="1"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-white outline-none focus:border-violet-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Episodes Per Season</label>
                <input
                  type="number"
                  name="episodesPerSeason"
                  value={formData.episodesPerSeason}
                  onChange={handleChange}
                  min="1"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-white outline-none focus:border-violet-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-violet-600 hover:bg-violet-750 disabled:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer mt-6"
            >
              <Send size={18} /> {submitting ? "Commissioning Series..." : "Authorize Production"}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProduceTVShow;
