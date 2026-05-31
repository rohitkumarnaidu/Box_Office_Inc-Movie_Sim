import { useCallback, useEffect, useMemo, useState } from "react";

import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";

import WriterCard from "../../components/writers/WriterCard";
import WritingProjectCard from "../../components/writers/WritingProjectCard";

const genres = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Romance",
  "Horror",
  "Thriller",
  "Mystery",
  "Sci-Fi",
  "Fantasy",
  "Survival",
  "Sports",
  "Crime",
  "War",
  "Historical",
  "Biography",
  "Political",
  "Animation",
  "Musical",
];

const filterAndSortWriters = (
  writers,
  search,
  selectedGenre,
  ageFilter,
  rarityFilter,
  sortBy,
) => {
  let filtered = [...writers];

  const query = search.trim().toLowerCase();

  if (query) {
    filtered = filtered.filter((writer) =>
      writer.name?.toLowerCase().includes(query),
    );
  }

  if (selectedGenre !== "All") {
    filtered = filtered.filter((writer) =>
      writer.genreExpertise?.includes(selectedGenre),
    );
  }

  if (ageFilter === "Young") {
    filtered = filtered.filter(
      (writer) => writer.age >= 18 && writer.age <= 30,
    );
  }

  if (ageFilter === "Prime") {
    filtered = filtered.filter((writer) => writer.age > 30 && writer.age <= 60);
  }

  if (ageFilter === "Veteran") {
    filtered = filtered.filter((writer) => writer.age > 60);
  }

  if (rarityFilter !== "All") {
    filtered = filtered.filter((writer) => writer.rarity === rarityFilter);
  }

  switch (sortBy) {
    case "salaryAsc":
      filtered.sort((a, b) => a.salary - b.salary);
      break;
    case "salaryDesc":
      filtered.sort((a, b) => b.salary - a.salary);
      break;
    case "ageAsc":
      filtered.sort((a, b) => a.age - b.age);
      break;
    case "ageDesc":
      filtered.sort((a, b) => b.age - a.age);
      break;
    case "reputationDesc":
      filtered.sort((a, b) => b.reputation - a.reputation);
      break;
    case "moraleDesc":
      filtered.sort((a, b) => b.morale - a.morale);
      break;
    default:
      break;
  }

  return filtered;
};

const Writers = () => {
  const [marketWriters, setMarketWriters] = useState([]);
  const [ownedWriters, setOwnedWriters] = useState([]);
  const [projects, setProjects] = useState([]);

  const [activeTab, setActiveTab] = useState("market");
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedWriter, setSelectedWriter] = useState(null);

  const [genre, setGenre] = useState("Action");
  const [targetAudience, setTargetAudience] = useState("Mass");

  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [ageFilter, setAgeFilter] = useState("All");
  const [rarityFilter, setRarityFilter] = useState("All");
  const [sortBy, setSortBy] = useState("salaryDesc");

  const [showFireModal, setShowFireModal] = useState(false);
  const [fireWriterData, setFireWriterData] = useState(null);
  const [replacementWriterId, setReplacementWriterId] = useState("");

  const fetchMarketWriters = useCallback(async () => {
    try {
      const res = await api.get("/writers");
      setMarketWriters(res.data.writers || []);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchOwnedWriters = useCallback(async () => {
    try {
      const res = await api.get("/writers/owned");
      setOwnedWriters(res.data.writers || []);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await api.get("/writers/projects");
      setProjects(res.data.projects || []);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchMarketWriters(),
        fetchOwnedWriters(),
        fetchProjects(),
      ]);
    } finally {
      setLoading(false);
    }
  }, [fetchMarketWriters, fetchOwnedWriters, fetchProjects]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleHire = async (index) => {
    try {
      await api.post(`/writers/hire/${index}`);
      await Promise.all([fetchMarketWriters(), fetchOwnedWriters()]);
      setActiveTab("owned");
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to hire writer");
    }
  };

  const openFireModal = (writer, index) => {
    setFireWriterData({
      writer,
      index,
    });
    setReplacementWriterId("");
    setShowFireModal(true);
  };

  const confirmFire = async () => {
    try {
      if (!fireWriterData) return;

      await api.post(`/writers/fire/${fireWriterData.index}`);

      await Promise.all([
        fetchMarketWriters(),
        fetchOwnedWriters(),
        fetchProjects(),
      ]);

      setShowFireModal(false);
      setFireWriterData(null);
      setReplacementWriterId("");
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to fire writer");
    }
  };

  const replaceWriter = async () => {
    try {
      if (!fireWriterData || !replacementWriterId) return;

      await api.post("/writers/replace-writer", {
        oldWriterId: fireWriterData.writer.id,
        newWriterId: replacementWriterId,
      });

      await Promise.all([fetchOwnedWriters(), fetchProjects()]);

      setShowFireModal(false);
      setFireWriterData(null);
      setReplacementWriterId("");
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to replace writer");
    }
  };

  const openWritingModal = (writer) => {
    setSelectedWriter(writer);
    setGenre(writer.genreExpertise?.[0] || "Action");
    setTargetAudience("Mass");
    setShowModal(true);
  };

  const startWriting = async () => {
    try {
      if (!selectedWriter) return;

      await api.post("/writers/start-writing", {
        writerId: selectedWriter.id,
        genre,
        targetAudience,
      });

      setShowModal(false);
      setSelectedWriter(null);

      await Promise.all([fetchOwnedWriters(), fetchProjects()]);
      setActiveTab("projects");
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to start writing");
    }
  };

  const filteredMarketWriters = useMemo(() => {
    return filterAndSortWriters(
      marketWriters,
      search,
      selectedGenre,
      ageFilter,
      rarityFilter,
      sortBy,
    );
  }, [marketWriters, search, selectedGenre, ageFilter, rarityFilter, sortBy]);

  const filteredOwnedWriters = useMemo(() => {
    return filterAndSortWriters(
      ownedWriters,
      search,
      selectedGenre,
      ageFilter,
      rarityFilter,
      sortBy,
    );
  }, [ownedWriters, search, selectedGenre, ageFilter, rarityFilter, sortBy]);

  const currentFireProject = useMemo(() => {
    if (!fireWriterData) return null;
    return (
      projects.find(
        (project) => project.writerId === fireWriterData.writer.id,
      ) || null
    );
  }, [projects, fireWriterData]);

  const availableReplacementWriters = useMemo(() => {
    if (!fireWriterData) return [];

    return ownedWriters.filter(
      (writer) =>
        writer.status === "AVAILABLE" && writer.id !== fireWriterData.writer.id,
    );
  }, [ownedWriters, fireWriterData]);

  const renderMarket = () => {
    if (filteredMarketWriters.length === 0) {
      return (
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            No Writers Available
          </h2>
          <p className="text-slate-400">
            Try clearing filters or the writer market is empty.
          </p>
        </div>
      );
    }

    return (
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredMarketWriters.map((writer) => (
          <WriterCard
            key={writer.id}
            writer={writer}
            index={marketWriters.findIndex((w) => w.id === writer.id)}
            mode="market"
            onHire={handleHire}
          />
        ))}
      </div>
    );
  };

  const renderOwned = () => {
    if (filteredOwnedWriters.length === 0) {
      return (
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            No Writers Hired
          </h2>
          <p className="text-slate-400">Hire writers from market.</p>
        </div>
      );
    }

    return (
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredOwnedWriters.map((writer) => (
          <WriterCard
            key={writer.id}
            writer={writer}
            index={ownedWriters.findIndex((w) => w.id === writer.id)}
            mode="owned"
            onFire={() =>
              openFireModal(
                writer,
                ownedWriters.findIndex((w) => w.id === writer.id),
              )
            }
            onStartWriting={openWritingModal}
          />
        ))}
      </div>
    );
  };

  const renderProjects = () => {
    if (projects.length === 0) {
      return (
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            No Active Projects
          </h2>
          <p className="text-slate-400">
            Start a writing project from your writers.
          </p>
        </div>
      );
    }

    return (
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {projects.map((project) => (
          <WritingProjectCard key={project.id} project={project} />
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">Writers</h1>
            <p className="text-slate-400 mt-2">
              Hire writers, create scripts and build your future franchises.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab("market")}
              className={`px-5 py-3 rounded-xl font-semibold transition ${
                activeTab === "market"
                  ? "bg-violet-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Market
            </button>

            <button
              onClick={() => setActiveTab("owned")}
              className={`px-5 py-3 rounded-xl font-semibold transition ${
                activeTab === "owned"
                  ? "bg-violet-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Owned
            </button>

            <button
              onClick={() => setActiveTab("projects")}
              className={`px-5 py-3 rounded-xl font-semibold transition ${
                activeTab === "projects"
                  ? "bg-violet-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Projects
            </button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search writer name..."
            className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-white placeholder:text-slate-500 outline-none focus:border-violet-500"
          />

          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-violet-500"
          >
            <option value="All">All Genres</option>
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          <select
            value={ageFilter}
            onChange={(e) => setAgeFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-violet-500"
          >
            <option value="All">All Ages</option>
            <option value="Young">18-30</option>
            <option value="Prime">31-60</option>
            <option value="Veteran">60+</option>
          </select>

          <select
            value={rarityFilter}
            onChange={(e) => setRarityFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-violet-500"
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
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-violet-500"
          >
            <option value="salaryDesc">Salary ↓</option>
            <option value="salaryAsc">Salary ↑</option>
            <option value="ageAsc">Age ↑</option>
            <option value="ageDesc">Age ↓</option>
            <option value="reputationDesc">Reputation ↓</option>
            <option value="moraleDesc">Morale ↓</option>
          </select>
        </div>

        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>
            Showing{" "}
            {activeTab === "market"
              ? filteredMarketWriters.length
              : activeTab === "owned"
                ? filteredOwnedWriters.length
                : projects.length}{" "}
            items
          </span>
          <button
            onClick={() => {
              setSearch("");
              setSelectedGenre("All");
              setAgeFilter("All");
              setRarityFilter("All");
              setSortBy("salaryDesc");
            }}
            className="text-violet-400 hover:text-violet-300 font-medium"
          >
            Clear filters
          </button>
        </div>

        {loading ? (
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-12 text-center">
            <h2 className="text-2xl font-bold text-white">Loading...</h2>
          </div>
        ) : (
          <>
            {activeTab === "market" && renderMarket()}
            {activeTab === "owned" && renderOwned()}
            {activeTab === "projects" && renderProjects()}
          </>
        )}

        {showModal && selectedWriter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-[#111827] p-6">
              <h2 className="mb-5 text-2xl font-bold text-white">
                Start Writing
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-slate-300">Genre</label>
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white outline-none focus:border-violet-500"
                  >
                    {genres.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-slate-300">
                    Target Audience
                  </label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white outline-none focus:border-violet-500"
                  >
                    <option value="Mass">Mass</option>
                    <option value="Family">Family</option>
                    <option value="Youth">Youth</option>
                    <option value="Adult">Adult</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={startWriting}
                  className="flex-1 rounded-xl bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700"
                >
                  Start
                </button>

                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedWriter(null);
                  }}
                  className="flex-1 rounded-xl bg-slate-700 py-3 font-semibold text-white transition hover:bg-slate-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showFireModal && fireWriterData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-[#111827] p-6">
              <h2 className="mb-2 text-2xl font-bold text-white">
                Writer Action
              </h2>

              <p className="mb-4 text-slate-300">
                {fireWriterData.writer.name}
              </p>

              {currentFireProject ? (
                <div className="mb-5 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Current Project</span>
                    <span className="text-slate-200">
                      {currentFireProject.genre}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-slate-400">Progress</span>
                    <span className="text-slate-200">
                      {currentFireProject.progress || 0}%
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mb-5 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <span className="text-slate-400">
                    No active project found for this writer.
                  </span>
                </div>
              )}

              <select
                value={replacementWriterId}
                onChange={(e) => setReplacementWriterId(e.target.value)}
                className="mb-4 w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white outline-none focus:border-violet-500"
              >
                <option value="">Select Replacement Writer</option>
                {availableReplacementWriters.map((writer) => (
                  <option key={writer.id} value={writer.id}>
                    {writer.name} - {writer.rarity} - ₹
                    {writer.salary?.toLocaleString()}
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={replaceWriter}
                  disabled={!replacementWriterId}
                  className="rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-700"
                >
                  Replace Writer
                </button>

                <button
                  onClick={confirmFire}
                  className="rounded-xl bg-red-600 py-3 font-semibold text-white transition hover:bg-red-700"
                >
                  Fire & Cancel
                </button>
              </div>

              <button
                onClick={() => {
                  setShowFireModal(false);
                  setFireWriterData(null);
                  setReplacementWriterId("");
                }}
                className="mt-3 w-full rounded-xl bg-slate-700 py-3 text-white transition hover:bg-slate-600"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Writers;
