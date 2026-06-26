import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import { showToast } from "../../features/ui/toastSlice";
import { STANDARD_CONTRACT_WEEKS, getTotalSalary } from "../../config/contract";
import {
  selectCrewFilters,
  setCrewFilters,
  resetCrewFilters,
} from "../../features/talent/talentSlice";
import SkeletonGrid from "../../components/common/SkeletonGrid";

// Average of a crew team's four skill stats — used for the quality filter
// and the overall-quality sort so "quality" means the same thing everywhere.
const getCrewQuality = (crew) => {
  const technical = Number(crew.technicalQuality || 0);
  const creativity = Number(crew.creativity || 0);
  const reliability = Number(crew.reliability || 0);
  const vfx = Number(crew.vfxQuality || 0);
  return (technical + creativity + reliability + vfx) / 4;
};

const filterAndSortCrew = (crewTeams, search, rarityFilter, qualityFilter, salaryFilter, sortBy) => {
  let filtered = [...crewTeams];

  const query = search.trim().toLowerCase();
  if (query) {
    filtered = filtered.filter((crew) => crew.name?.toLowerCase().includes(query));
  }

  if (rarityFilter !== "All") {
    filtered = filtered.filter((crew) => crew.rarity === rarityFilter);
  }

  if (qualityFilter === "Basic") {
    filtered = filtered.filter((crew) => getCrewQuality(crew) < 50);
  }

  if (qualityFilter === "Skilled") {
    filtered = filtered.filter((crew) => getCrewQuality(crew) >= 50 && getCrewQuality(crew) < 75);
  }

  if (qualityFilter === "Elite") {
    filtered = filtered.filter((crew) => getCrewQuality(crew) >= 75);
  }

  if (salaryFilter === "Budget") {
    filtered = filtered.filter((crew) => Number(crew.salary || 0) < 150000);
  }

  if (salaryFilter === "MidRange") {
    filtered = filtered.filter(
      (crew) => Number(crew.salary || 0) >= 150000 && Number(crew.salary || 0) < 400000,
    );
  }

  if (salaryFilter === "Premium") {
    filtered = filtered.filter((crew) => Number(crew.salary || 0) >= 400000);
  }

  switch (sortBy) {
    case "technicalDesc":
      filtered.sort((a, b) => Number(b.technicalQuality || 0) - Number(a.technicalQuality || 0));
      break;
    case "qualityDesc":
      filtered.sort((a, b) => getCrewQuality(b) - getCrewQuality(a));
      break;
    case "vfxDesc":
      filtered.sort((a, b) => Number(b.vfxQuality || 0) - Number(a.vfxQuality || 0));
      break;
    case "creativityDesc":
      filtered.sort((a, b) => Number(b.creativity || 0) - Number(a.creativity || 0));
      break;
    case "reliabilityDesc":
      filtered.sort((a, b) => Number(b.reliability || 0) - Number(a.reliability || 0));
      break;
    case "salaryAsc":
      filtered.sort((a, b) => Number(a.salary || 0) - Number(b.salary || 0));
      break;
    case "salaryDesc":
      filtered.sort((a, b) => Number(b.salary || 0) - Number(a.salary || 0));
      break;
    default:
      break;
  }

  return filtered;
};

const CrewMarket = () => {
  const dispatch = useDispatch();
  const filters = useSelector(selectCrewFilters);
  const { search, rarityFilter, qualityFilter, salaryFilter, sortBy } = filters;

  const setSearch = (value) => dispatch(setCrewFilters({ search: value }));
  const setRarityFilter = (value) => dispatch(setCrewFilters({ rarityFilter: value }));
  const setQualityFilter = (value) => dispatch(setCrewFilters({ qualityFilter: value }));
  const setSalaryFilter = (value) => dispatch(setCrewFilters({ salaryFilter: value }));
  const setSortBy = (value) => dispatch(setCrewFilters({ sortBy: value }));

  const [crewTeams, setCrewTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCrewTeams = useCallback(async (showSkeleton = true) => {
    try {
      if (showSkeleton) {
        setLoading(true);
      }

      const res = await api.get("/crew");
      setCrewTeams(res.data.crewTeams || []);
    } catch (error) {
      console.error(error);
    } finally {
      if (showSkeleton) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const refreshTimer = window.setTimeout(fetchCrewTeams, 0);

    return () => window.clearTimeout(refreshTimer);
  }, [fetchCrewTeams]);

  const handleHire = async (id) => {
    if (loading || actionLoading) return;

    try {
      setActionLoading(true);
      await api.post(`/crew/hire/${id}`);
      dispatch(showToast({ message: "Crew team hired successfully!", type: "success" }));
      await fetchCrewTeams(false);
    } catch (error) {
      dispatch(showToast({
        message: error?.response?.data?.message || "Failed to hire crew team",
        type: "error"
      }));
    } finally {
      setActionLoading(false);
    }
  };

  const filteredCrew = useMemo(
    () => filterAndSortCrew(crewTeams, search, rarityFilter, qualityFilter, salaryFilter, sortBy),
    [crewTeams, search, rarityFilter, qualityFilter, salaryFilter, sortBy],
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-white">Crew Market</h1>
          <p className="text-slate-400 mt-2">Hire professional production units to bring your movies to life.</p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <input
            type="text"
            placeholder="Search crew teams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111827] border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-violet-600"
          />
          <select
            value={rarityFilter}
            onChange={(e) => setRarityFilter(e.target.value)}
            className="bg-[#111827] border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-violet-600"
          >
            <option value="All">All Rarities</option>
            <option value="COMMON">Common</option>
            <option value="UNCOMMON">Uncommon</option>
            <option value="RARE">Rare</option>
            <option value="EPIC">Epic</option>
            <option value="LEGENDARY">Legendary</option>
          </select>
          <select
            value={qualityFilter}
            onChange={(e) => setQualityFilter(e.target.value)}
            className="bg-[#111827] border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-violet-600"
          >
            <option value="All">All Quality</option>
            <option value="Basic">Basic (&lt; 50)</option>
            <option value="Skilled">Skilled (50-74)</option>
            <option value="Elite">Elite (75+)</option>
          </select>
          <select
            value={salaryFilter}
            onChange={(e) => setSalaryFilter(e.target.value)}
            className="bg-[#111827] border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-violet-600"
          >
            <option value="All">All Salaries</option>
            <option value="Budget">Budget (&lt; ₹150k)</option>
            <option value="MidRange">Mid-Range</option>
            <option value="Premium">Premium (₹400k+)</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#111827] border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-violet-600"
          >
            <option value="technicalDesc">Technical ↓</option>
            <option value="qualityDesc">Overall Quality ↓</option>
            <option value="vfxDesc">VFX ↓</option>
            <option value="creativityDesc">Creativity ↓</option>
            <option value="reliabilityDesc">Reliability ↓</option>
            <option value="salaryAsc">Salary ↑</option>
            <option value="salaryDesc">Salary ↓</option>
          </select>
        </div>

        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>
            Showing {filteredCrew.length} of {crewTeams.length} crew teams
          </span>
          <button
            onClick={() => dispatch(resetCrewFilters())}
            className="font-medium text-violet-400 hover:text-violet-300"
          >
            Clear filters
          </button>
        </div>

        {loading ? (
          <SkeletonGrid variant="compact" />
        ) : filteredCrew.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-[#111827] p-12 text-center">
            <h2 className="mb-3 text-2xl font-bold text-white">No Crew Teams</h2>
            <p className="text-slate-400">No crew teams match your filters.</p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 ${actionLoading ? "pointer-events-none opacity-70" : ""}`}>
            {filteredCrew.map((crew) => (
              <div key={crew.id} className="bg-[#111827] border border-slate-800 rounded-2xl p-6 hover:border-violet-600 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white group-hover:text-violet-400 transition-colors">{crew.name}</h3>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                    crew.rarity === 'LEGENDARY' ? 'bg-orange-500/20 text-orange-500' :
                    crew.rarity === 'EPIC' ? 'bg-purple-500/20 text-purple-500' :
                    crew.rarity === 'RARE' ? 'bg-blue-500/20 text-blue-500' :
                    'bg-slate-500/20 text-slate-400'
                  }`}>
                    {crew.rarity}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div className="text-slate-400">Technical: <span className="text-white">{crew.technicalQuality}</span></div>
                  <div className="text-slate-400">Creativity: <span className="text-white">{crew.creativity}</span></div>
                  <div className="text-slate-400">Reliability: <span className="text-white">{crew.reliability}</span></div>
                  <div className="text-slate-400">VFX: <span className="text-white">{crew.vfxQuality}</span></div>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <div>
                    <div className="text-violet-400 font-bold">₹{crew.salary.toLocaleString()}/wk</div>
                    <div className="text-xs text-slate-400">
                      Total ₹{getTotalSalary(crew.salary, STANDARD_CONTRACT_WEEKS).toLocaleString()}
                      <span className="ml-1">({STANDARD_CONTRACT_WEEKS}w)</span>
                    </div>
                  </div>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleHire(crew.id)}
                    className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50"
                  >
                    {actionLoading ? "Hiring..." : "Hire Team"}
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

export default CrewMarket;
