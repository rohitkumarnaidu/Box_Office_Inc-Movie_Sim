import { useState, useEffect, useCallback } from "react";
import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { Film, Users, PenTool, Briefcase, IndianRupee, Check, Sparkles } from "lucide-react";

const MARKETING_CAMPAIGNS = [
  { id: "trailer", name: "Trailer Campaign", cost: 100000, hypeBoost: 8 },
  { id: "teaser", name: "Teaser Campaign", cost: 50000, hypeBoost: 4 },
  { id: "pr", name: "PR Campaign", cost: 200000, hypeBoost: 12 },
  { id: "tv", name: "TV Advertising", cost: 500000, hypeBoost: 25 },
  { id: "newspaper", name: "Newspaper Advertising", cost: 50000, hypeBoost: 3 },
  { id: "digital", name: "Digital Ads", cost: 250000, hypeBoost: 15 },
  { id: "social", name: "Social Media Campaign", cost: 150000, hypeBoost: 10 },
  { id: "influencer", name: "Influencer Campaign", cost: 300000, hypeBoost: 18 },
  { id: "billboards", name: "Billboards", cost: 200000, hypeBoost: 10 },
];

// Mirror of the server-side genre effectiveness map (backend/src/constants/
// marketingCampaigns.js). The server is authoritative for the hype actually
// applied; this copy lets the movie-creation screen preview how effective each
// campaign is for the selected script's genres. Keep the two in sync.
const CAMPAIGN_GENRE_EFFECTIVENESS = {
  Horror: { social: 1.5, influencer: 1.4, digital: 1.2 },
  Action: { trailer: 1.5, teaser: 1.3, tv: 1.3 },
  Drama: { pr: 1.5, newspaper: 1.3 },
  "Sci-Fi": { digital: 1.4, social: 1.3, influencer: 1.3 },
  Animation: { tv: 1.5, billboards: 1.3, social: 1.2 },
  Comedy: { social: 1.4, digital: 1.3 },
  Romance: { social: 1.3, pr: 1.3 },
  Thriller: { trailer: 1.4, digital: 1.3 },
  Adventure: { trailer: 1.3, tv: 1.3 },
  Fantasy: { trailer: 1.3, digital: 1.3 },
};

const getCampaignEffectiveness = (campaignId, genres) => {
  if (!Array.isArray(genres) || genres.length === 0) return 1;
  let best = 1;
  for (const genre of genres) {
    const multiplier = CAMPAIGN_GENRE_EFFECTIVENESS[genre]?.[campaignId];
    if (typeof multiplier === "number" && multiplier > best) {
      best = multiplier;
    }
  }
  return best;
};

const CreateMovie = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [scripts, setScripts] = useState([]);
  const [directors, setDirectors] = useState([]);
  const [actors, setActors] = useState([]);
  const [crewTeams, setCrewTeams] = useState([]);
  const [franchises, setFranchises] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    scriptId: "",
    directorId: "",
    leadActorId: "",
    crewTeamId: "",
    marketingCampaignIds: [],
    franchiseId: "",
    createFranchise: false,
    franchiseName: ""
  });

  const loadData = useCallback(async () => {
    try {
      setFetching(true);
      const [sRes, dRes, aRes, cRes, fRes] = await Promise.all([
        api.get("/scripts/owned"),
        api.get("/directors/owned"),
        api.get("/actors/owned"),
        api.get("/crew/owned"),
        api.get("/franchises").catch(() => ({ data: { franchises: [] } }))
      ]);
      setScripts(sRes.data.scripts.filter(s => s.status === "AVAILABLE"));
      setDirectors(dRes.data.directors.filter(d => d.status === "AVAILABLE"));
      setActors(aRes.data.actors.filter(a => a.status === "AVAILABLE"));
      setCrewTeams(cRes.data.crewTeams.filter(c => c.status === "AVAILABLE"));
      setFranchises(fRes.data.franchises || []);
    } catch (error) {
      console.error("Failed to load movie creation data", error);
    } finally {
        setFetching(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleCampaign = (id) => {
    setFormData(prev => {
        const current = prev.marketingCampaignIds;
        if (current.includes(id)) {
            return { ...prev, marketingCampaignIds: current.filter(cid => cid !== id) };
        } else {
            return { ...prev, marketingCampaignIds: [...current, id] };
        }
    });
  };

  const totalMarketingBudget = formData.marketingCampaignIds.reduce((sum, id) => {
    const campaign = MARKETING_CAMPAIGNS.find(c => c.id === id);
    return sum + (campaign?.cost || 0);
  }, 0);

  const selectedScript = scripts.find(s => s.id === formData.scriptId);
  const selectedGenres = selectedScript?.genres || [];

  const totalEffectiveHype = formData.marketingCampaignIds.reduce((sum, id) => {
    const campaign = MARKETING_CAMPAIGNS.find(c => c.id === id);
    if (!campaign) return sum;
    return sum + Math.round(campaign.hypeBoost * getCampaignEffectiveness(id, selectedGenres));
  }, 0);

  const generateTitle = async () => {
    try {
        const res = await api.get("/movies/generate-title");
        setFormData(prev => ({ ...prev, title: res.data.title }));
    } catch (error) {
        console.error("Failed to generate title");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      await api.post("/movies", formData);
      navigate("/movies");
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to start production");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
      return (
          <DashboardLayout>
              <div className="flex items-center justify-center min-h-[60vh] text-white font-bold">
                  Loading Studio Data...
              </div>
          </DashboardLayout>
      );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        <div>
          <h1 className="text-4xl font-bold text-white">Start New Production</h1>
          <p className="text-slate-400 mt-2">Assemble your dream team and create the next blockbuster.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 space-y-8">
            <div>
              <label className="block text-slate-300 mb-2 font-semibold flex justify-between items-center">
                <span>Movie Title</span>
                <button
                    type="button"
                    onClick={generateTitle}
                    className="text-violet-400 hover:text-violet-300 text-xs font-black uppercase flex items-center gap-1 transition"
                >
                    <Sparkles size={14} /> Generate
                </button>
              </label>
              <input
                type="text"
                required
                disabled={loading}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-violet-600 disabled:opacity-50"
                placeholder="Enter movie title..."
              />
            </div>

            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-4">
               <h3 className="text-white font-bold mb-4">Franchise & Universe</h3>
               <div className="flex items-center gap-4 mb-4">
                 <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                   <input
                     type="checkbox"
                     checked={formData.createFranchise}
                     onChange={(e) => setFormData({ ...formData, createFranchise: e.target.checked, franchiseId: "" })}
                     className="w-4 h-4 text-violet-600 bg-slate-900 border-slate-700 rounded focus:ring-violet-600"
                   />
                   Start a New Franchise
                 </label>
               </div>

               {formData.createFranchise ? (
                 <div>
                    <label className="block text-slate-400 text-sm mb-2">New Franchise Name</label>
                    <input
                      type="text"
                      required={formData.createFranchise}
                      value={formData.franchiseName}
                      onChange={(e) => setFormData({ ...formData, franchiseName: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-violet-600"
                      placeholder="e.g., The Cinematic Universe"
                    />
                 </div>
               ) : (
                 <div>
                    <label className="block text-slate-400 text-sm mb-2">Part of Existing Franchise?</label>
                    <select
                      value={formData.franchiseId}
                      onChange={(e) => setFormData({ ...formData, franchiseId: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-violet-600"
                    >
                      <option value="">No Franchise (Standalone)</option>
                      {franchises.map(f => (
                        <option key={f._id} value={f._id}>{f.name} ({f.movies?.length || 0} movies)</option>
                      ))}
                    </select>
                 </div>
               )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-slate-300 mb-2 font-semibold flex items-center gap-2">
                  <Film size={18} className="text-violet-500" /> Select Script
                </label>
                <select
                  required
                  disabled={loading}
                  value={formData.scriptId}
                  onChange={(e) => setFormData({ ...formData, scriptId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-violet-600 disabled:opacity-50"
                >
                  <option value="">Select a script</option>
                  {scripts.map(s => (
                    <option key={s.id} value={s.id}>{s.title} ({s.rarity})</option>
                  ))}
                </select>
                {scripts.length === 0 && <p className="text-xs text-red-400 mt-1">No available scripts found.</p>}
              </div>

              <div>
                <label className="block text-slate-300 mb-2 font-semibold flex items-center gap-2">
                  <PenTool size={18} className="text-violet-500" /> Select Director
                </label>
                <select
                  required
                  disabled={loading}
                  value={formData.directorId}
                  onChange={(e) => setFormData({ ...formData, directorId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-violet-600 disabled:opacity-50"
                >
                  <option value="">Select a director</option>
                  {directors.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.rarity})</option>
                  ))}
                </select>
                {directors.length === 0 && <p className="text-xs text-red-400 mt-1">No available directors found.</p>}
              </div>

              <div>
                <label className="block text-slate-300 mb-2 font-semibold flex items-center gap-2">
                  <Users size={18} className="text-violet-500" /> Lead Actor
                </label>
                <select
                  required
                  disabled={loading}
                  value={formData.leadActorId}
                  onChange={(e) => setFormData({ ...formData, leadActorId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-violet-600 disabled:opacity-50"
                >
                  <option value="">Select an actor</option>
                  {actors.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.rarity})</option>
                  ))}
                </select>
                {actors.length === 0 && <p className="text-xs text-red-400 mt-1">No available actors found.</p>}
              </div>

              <div>
                <label className="block text-slate-300 mb-2 font-semibold flex items-center gap-2">
                  <Briefcase size={18} className="text-violet-500" /> Crew Team
                </label>
                <select
                  required
                  disabled={loading}
                  value={formData.crewTeamId}
                  onChange={(e) => setFormData({ ...formData, crewTeamId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-violet-600 disabled:opacity-50"
                >
                  <option value="">Select a crew team</option>
                  {crewTeams.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.rarity})</option>
                  ))}
                </select>
                {crewTeams.length === 0 && <p className="text-xs text-red-400 mt-1">No available crew teams found.</p>}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-4 font-semibold flex items-center gap-2 border-b border-slate-800 pb-2">
                <IndianRupee size={18} className="text-violet-500" /> Marketing Campaigns
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {MARKETING_CAMPAIGNS.map(campaign => {
                    const active = formData.marketingCampaignIds.includes(campaign.id);
                    const effectiveness = getCampaignEffectiveness(campaign.id, selectedGenres);
                    const effectiveHype = Math.round(campaign.hypeBoost * effectiveness);
                    const boosted = effectiveness > 1;
                    return (
                        <button
                            key={campaign.id}
                            type="button"
                            disabled={loading}
                            onClick={() => toggleCampaign(campaign.id)}
                            className={`p-4 rounded-xl border text-left transition-all relative ${
                                active
                                ? 'bg-violet-600/20 border-violet-500'
                                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                            }`}
                        >
                            <div className="text-white font-bold text-sm mb-1">{campaign.name}</div>
                            <div className="text-violet-400 font-bold text-xs">₹{campaign.cost.toLocaleString()}</div>
                            <div className="text-xs mt-1 flex flex-wrap items-center gap-1">
                                <span className={boosted ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                                    +{effectiveHype} hype
                                </span>
                                {boosted && (
                                    <span className="text-emerald-400 font-semibold">
                                        ↑ x{effectiveness.toFixed(1)} genre match
                                    </span>
                                )}
                            </div>
                            {active && <div className="absolute top-2 right-2 bg-violet-500 rounded-full p-0.5"><Check size={12} className="text-white" /></div>}
                        </button>
                    )
                })}
              </div>

              <div className="mt-6 p-4 bg-slate-950 rounded-xl flex justify-between items-center border border-slate-800">
                <span className="text-slate-400 font-bold uppercase text-xs">Total Marketing Budget</span>
                <span className="text-white font-black text-xl">₹{totalMarketingBudget.toLocaleString()}</span>
              </div>
              {formData.marketingCampaignIds.length > 0 && (
                <div className="mt-3 p-4 bg-slate-950 rounded-xl flex justify-between items-center border border-slate-800">
                  <span className="text-slate-400 font-bold uppercase text-xs">
                    Est. Hype from Marketing{selectedGenres.length > 0 ? ` (for ${selectedGenres.join(', ')})` : ''}
                  </span>
                  <span className="text-emerald-400 font-black text-xl">+{totalEffectiveHype}</span>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || fetching}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white py-5 rounded-2xl font-black text-xl tracking-wide uppercase transition disabled:bg-slate-700 disabled:cursor-not-allowed shadow-xl shadow-violet-950/20"
          >
            {loading ? "Starting Production..." : "Launch Production"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateMovie;
