import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import api from "../../api/axios";
import ActorCard from "../../components/actors/ActorCard";
import DashboardLayout from "../../layouts/DashboardLayout";
import SkeletonGrid from "../../components/common/SkeletonGrid";
import {
  selectActorFilters,
  setActorFilters,
  resetActorFilters,
} from "../../features/talent/talentSlice";

const getHitRate = (actor) => {
  const movies = Number(actor.movies || 0);

  if (movies === 0) {
    return 0;
  }

  return (Number(actor.hitMovies || 0) / movies) * 100;
};

const filterAndSortActors = (
  actors,
  search,
  ageFilter,
  popularityFilter,
  fanbaseFilter,
  salaryFilter,
  awardsFilter,
  rarityFilter,
  sortBy,
) => {
  let filtered = actors.map((actor, originalIndex) => ({
    ...actor,
    originalIndex,
  }));

  const query = search.trim().toLowerCase();

  if (query) {
    filtered = filtered.filter((actor) => actor.name?.toLowerCase().includes(query));
  }

  if (ageFilter === "Young") {
    filtered = filtered.filter((actor) => actor.age >= 18 && actor.age <= 30);
  }

  if (ageFilter === "Prime") {
    filtered = filtered.filter((actor) => actor.age > 30 && actor.age <= 60);
  }

  if (ageFilter === "Veteran") {
    filtered = filtered.filter((actor) => actor.age > 60);
  }

  if (popularityFilter === "Rising") {
    filtered = filtered.filter((actor) => Number(actor.popularity || 0) < 40);
  }

  if (popularityFilter === "Popular") {
    filtered = filtered.filter(
      (actor) => Number(actor.popularity || 0) >= 40 && Number(actor.popularity || 0) < 75,
    );
  }

  if (popularityFilter === "Star") {
    filtered = filtered.filter((actor) => Number(actor.popularity || 0) >= 75);
  }

  if (fanbaseFilter === "Small") {
    filtered = filtered.filter((actor) => Number(actor.fanbase || 0) < 250000);
  }

  if (fanbaseFilter === "Medium") {
    filtered = filtered.filter(
      (actor) => Number(actor.fanbase || 0) >= 250000 && Number(actor.fanbase || 0) < 750000,
    );
  }

  if (fanbaseFilter === "Large") {
    filtered = filtered.filter((actor) => Number(actor.fanbase || 0) >= 750000);
  }

  if (salaryFilter === "Budget") {
    filtered = filtered.filter((actor) => Number(actor.salary || 0) < 150000);
  }

  if (salaryFilter === "MidRange") {
    filtered = filtered.filter(
      (actor) => Number(actor.salary || 0) >= 150000 && Number(actor.salary || 0) < 400000,
    );
  }

  if (salaryFilter === "Premium") {
    filtered = filtered.filter((actor) => Number(actor.salary || 0) >= 400000);
  }

  if (awardsFilter === "Awarded") {
    filtered = filtered.filter((actor) => Number(actor.awards || 0) > 0);
  }

  if (awardsFilter === "NoAwards") {
    filtered = filtered.filter((actor) => Number(actor.awards || 0) === 0);
  }

  if (rarityFilter !== "All") {
    filtered = filtered.filter((actor) => actor.rarity === rarityFilter);
  }

  switch (sortBy) {
    case "popularityDesc":
      filtered.sort((a, b) => Number(b.popularity || 0) - Number(a.popularity || 0));
      break;
    case "actingSkillDesc":
      filtered.sort((a, b) => Number(b.actingSkill || 0) - Number(a.actingSkill || 0));
      break;
    case "fanbaseDesc":
      filtered.sort((a, b) => Number(b.fanbase || 0) - Number(a.fanbase || 0));
      break;
    case "boxOfficeDesc":
      filtered.sort((a, b) => Number(b.boxOfficeTotal || 0) - Number(a.boxOfficeTotal || 0));
      break;
    case "awardsDesc":
      filtered.sort((a, b) => Number(b.awards || 0) - Number(a.awards || 0));
      break;
    case "salaryAsc":
      filtered.sort((a, b) => Number(a.salary || 0) - Number(b.salary || 0));
      break;
    case "salaryDesc":
      filtered.sort((a, b) => Number(b.salary || 0) - Number(a.salary || 0));
      break;
    case "ageAsc":
      filtered.sort((a, b) => Number(a.age || 0) - Number(b.age || 0));
      break;
    case "ageDesc":
      filtered.sort((a, b) => Number(b.age || 0) - Number(a.age || 0));
      break;
    default:
      break;
  }

  return filtered;
};

const Actors = () => {
  const [marketActors, setMarketActors] = useState([]);
  const [ownedActors, setOwnedActors] = useState([]);
  const [activeTab, setActiveTab] = useState("market");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const dispatch = useDispatch();
  const filters = useSelector(selectActorFilters);
  const {
    search,
    ageFilter,
    popularityFilter,
    fanbaseFilter,
    salaryFilter,
    awardsFilter,
    rarityFilter,
    sortBy,
  } = filters;

  // Local setters that patch the persisted slice, preserving the original
  // call-sites (setSearch(value), setAgeFilter(value), ...).
  const setSearch = (value) => dispatch(setActorFilters({ search: value }));
  const setAgeFilter = (value) => dispatch(setActorFilters({ ageFilter: value }));
  const setPopularityFilter = (value) => dispatch(setActorFilters({ popularityFilter: value }));
  const setFanbaseFilter = (value) => dispatch(setActorFilters({ fanbaseFilter: value }));
  const setSalaryFilter = (value) => dispatch(setActorFilters({ salaryFilter: value }));
  const setAwardsFilter = (value) => dispatch(setActorFilters({ awardsFilter: value }));
  const setRarityFilter = (value) => dispatch(setActorFilters({ rarityFilter: value }));
  const setSortBy = (value) => dispatch(setActorFilters({ sortBy: value }));

  const fetchMarketActors = useCallback(async () => {
    const res = await api.get("/actors");
    setMarketActors(res.data.actors || []);
  }, []);

  const fetchOwnedActors = useCallback(async () => {
    const res = await api.get("/actors/owned");
    setOwnedActors(res.data.actors || []);
  }, []);

  const loadActors = useCallback(async () => {
    try {
      setError("");
      setNotice("");
      setLoading(true);
      await Promise.all([fetchMarketActors(), fetchOwnedActors()]);
    } catch (loadError) {
      console.error(loadError);
      setError(loadError?.response?.data?.message || "Failed to load actors");
    } finally {
      setLoading(false);
    }
  }, [fetchMarketActors, fetchOwnedActors]);

  useEffect(() => {
    const refreshTimer = window.setTimeout(loadActors, 0);

    return () => window.clearTimeout(refreshTimer);
  }, [loadActors]);

  const handleHire = async (index) => {
    try {
      setActionLoading(true);
      setError("");
      setNotice("");
      const res = await api.post(`/actors/hire/${index}`);
      setMarketActors(res.data.marketActors || []);
      setOwnedActors(res.data.ownedActors || []);
      setActiveTab("owned");
      setNotice(
        `${res.data.actor?.name || "Actor"} hired. Signing fee ₹${Number(res.data.signingFee || 0).toLocaleString()}. Balance ₹${Number(res.data.remainingMoney || 0).toLocaleString()}.`
      );
    } catch (hireError) {
      console.error(hireError);
      setError(hireError?.response?.data?.message || "Failed to hire actor");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFire = async (index) => {
    try {
      setActionLoading(true);
      setError("");
      setNotice("");
      const res = await api.post(`/actors/fire/${index}`);
      setMarketActors(res.data.marketActors || []);
      setOwnedActors(res.data.ownedActors || []);
      setActiveTab("market");
      setNotice(
        `${res.data.actor?.name || "Actor"} released. Compensation ₹${Number(
          res.data.compensation || 0,
        ).toLocaleString("en-IN")} paid and ${res.data.fanLoss || 0} fans lost.`,
      );
    } catch (fireError) {
      console.error(fireError);
      setError(fireError?.response?.data?.message || "Failed to release actor");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredMarketActors = useMemo(
    () =>
      filterAndSortActors(
        marketActors,
        search,
        ageFilter,
        popularityFilter,
        fanbaseFilter,
        salaryFilter,
        awardsFilter,
        rarityFilter,
        sortBy,
      ),
    [marketActors, search, ageFilter, popularityFilter, fanbaseFilter, salaryFilter, awardsFilter, rarityFilter, sortBy],
  );

  const filteredOwnedActors = useMemo(
    () =>
      filterAndSortActors(
        ownedActors,
        search,
        ageFilter,
        popularityFilter,
        fanbaseFilter,
        salaryFilter,
        awardsFilter,
        rarityFilter,
        sortBy,
      ),
    [ownedActors, search, ageFilter, popularityFilter, fanbaseFilter, salaryFilter, awardsFilter, rarityFilter, sortBy],
  );

  const currentActors = activeTab === "market" ? filteredMarketActors : filteredOwnedActors;

  const clearFilters = () => {
    dispatch(resetActorFilters());
  };

  const renderActors = () => {
    if (currentActors.length === 0) {
      return (
        <div className="rounded-2xl border border-slate-800 bg-[#111827] p-12 text-center">
          <h2 className="mb-3 text-2xl font-bold text-white">
            {activeTab === "market" ? "No Market Actors" : "No Owned Actors"}
          </h2>
          <p className="text-slate-400">
            {activeTab === "market" ? "No actors match your market filters." : "No owned actors match your filters."}
          </p>
        </div>
      );
    }

    return (
      <div className={actionLoading ? "pointer-events-none opacity-70" : ""}>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {currentActors.map((actor) => (
            <ActorCard
              key={actor.id || `${actor.name}-${actor.originalIndex}`}
              actor={actor}
              index={actor.originalIndex}
              mode={activeTab}
              onHire={handleHire}
              onFire={handleFire}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">Actors</h1>
            <p className="mt-2 text-slate-400">
              Scout performers, compare star power, and manage your acting talent roster.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab("market")}
              className={`rounded-xl px-5 py-3 font-semibold transition ${
                activeTab === "market"
                  ? "bg-violet-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Market ({marketActors.length})
            </button>

            <button
              onClick={() => setActiveTab("owned")}
              className={`rounded-xl px-5 py-3 font-semibold transition ${
                activeTab === "owned"
                  ? "bg-violet-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Owned ({ownedActors.length})
            </button>

            <button
              onClick={loadActors}
              disabled={loading || actionLoading}
              className="rounded-xl bg-slate-800 px-5 py-3 font-semibold text-slate-300 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-8">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search actor name..."
            className="rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none placeholder:text-slate-500 focus:border-violet-500"
          />

          <select
            value={ageFilter}
            onChange={(event) => setAgeFilter(event.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-violet-500"
          >
            <option value="All">All Ages</option>
            <option value="Young">18-30</option>
            <option value="Prime">31-60</option>
            <option value="Veteran">60+</option>
          </select>

          <select
            value={popularityFilter}
            onChange={(event) => setPopularityFilter(event.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-violet-500"
          >
            <option value="All">All Popularity</option>
            <option value="Rising">Rising (&lt; 40)</option>
            <option value="Popular">Popular (40-74)</option>
            <option value="Star">Star (75+)</option>
          </select>

          <select
            value={fanbaseFilter}
            onChange={(event) => setFanbaseFilter(event.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-violet-500"
          >
            <option value="All">All Fanbases</option>
            <option value="Small">Small (&lt; 250k)</option>
            <option value="Medium">Medium</option>
            <option value="Large">Large (750k+)</option>
          </select>

          <select
            value={salaryFilter}
            onChange={(event) => setSalaryFilter(event.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-violet-500"
          >
            <option value="All">All Salaries</option>
            <option value="Budget">Budget (&lt; ₹150k)</option>
            <option value="MidRange">Mid-Range</option>
            <option value="Premium">Premium (₹400k+)</option>
          </select>

          <select
            value={awardsFilter}
            onChange={(event) => setAwardsFilter(event.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-violet-500"
          >
            <option value="All">All Awards</option>
            <option value="Awarded">Award Winners</option>
            <option value="NoAwards">No Awards</option>
          </select>

          <select
            value={rarityFilter}
            onChange={(event) => setRarityFilter(event.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-violet-500"
          >
            <option value="All">All Rarities</option>
            <option value="Common">Common</option>
            <option value="Uncommon">Uncommon</option>
            <option value="Rare">Rare</option>
            <option value="Epic">Epic</option>
            <option value="Legendary">Legendary</option>
          </select>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-violet-500"
          >
            <option value="popularityDesc">Popularity ↓</option>
            <option value="actingSkillDesc">Acting Skill ↓</option>
            <option value="fanbaseDesc">Fanbase ↓</option>
            <option value="boxOfficeDesc">Box Office ↓</option>
            <option value="awardsDesc">Awards ↓</option>
            <option value="salaryAsc">Salary ↑</option>
            <option value="salaryDesc">Salary ↓</option>
            <option value="ageAsc">Youngest</option>
            <option value="ageDesc">Oldest</option>
          </select>
        </div>

        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>
            Showing {currentActors.length} of {activeTab === "market" ? marketActors.length : ownedActors.length} actors
          </span>
          <button onClick={clearFilters} className="font-medium text-violet-400 hover:text-violet-300">
            Clear filters
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5">
            <p className="text-sm text-slate-400">Market Actors</p>
            <p className="mt-2 text-3xl font-bold text-white">{marketActors.length}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5">
            <p className="text-sm text-slate-400">Owned Actors</p>
            <p className="mt-2 text-3xl font-bold text-white">{ownedActors.length}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5">
            <p className="text-sm text-slate-400">Average Hit Rate</p>
            <p className="mt-2 text-3xl font-bold text-white">
              {currentActors.length === 0
                ? "0.0%"
                : `${(
                    currentActors.reduce((sum, actor) => sum + getHitRate(actor), 0) /
                    currentActors.length
                  ).toFixed(1)}%`}
            </p>
          </div>
        </div>

        {notice && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-200">
            {notice}
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <SkeletonGrid variant="talent" />
        ) : (
          renderActors()
        )}
      </div>
    </DashboardLayout>
  );
};

export default Actors;
