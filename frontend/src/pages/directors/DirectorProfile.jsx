import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import { DetailSkeleton } from "../../components/common/SkeletonGrid";

const tabs = ["Overview", "Career", "Statistics", "Awards", "Filmography"];

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
const formatPercent = (value) => `${Number(value || 0).toFixed(1)}%`;

const StatCard = ({ label, value }) => (
  <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5">
    <p className="text-sm text-slate-400">{label}</p>
    <p className="mt-2 text-2xl font-bold text-white">{value}</p>
  </div>
);

const EmptyState = ({ message }) => (
  <div className="rounded-2xl border border-slate-800 bg-[#111827] p-10 text-center text-slate-400">
    {message}
  </div>
);

const DirectorProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/directors/${id}`);
      setProfile(res.data.profile);
    } catch (loadError) {
      console.error(loadError);
      setError(loadError?.response?.data?.message || "Failed to load director profile");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const refreshTimer = window.setTimeout(loadProfile, 0);

    return () => window.clearTimeout(refreshTimer);
  }, [loadProfile]);

  if (loading) {
    return <DashboardLayout><DetailSkeleton title="Loading director profile..." /></DashboardLayout>;
  }

  if (error || !profile) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <Link to="/directors" className="text-violet-400 hover:text-violet-300">
            ← Back to Directors
          </Link>
          <div className="rounded-2xl border border-red-900 bg-[#111827] p-12 text-center">
            <h2 className="text-2xl font-bold text-white">{error}</h2>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const {
    personalInformation,
    careerInformation,
    statistics,
    careerTimeline,
    awards,
    salaryHistory,
  } = profile;
  const avatar = `https://api.dicebear.com/7.x/personas/svg?seed=${personalInformation.avatarSeed}`;

  const renderOverview = () => (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Reputation" value={personalInformation.reputation} />
      <StatCard label="Morale" value={personalInformation.morale} />
      <StatCard label="Salary" value={`${formatCurrency(personalInformation.salary)}/week`} />
      <StatCard label="Awards" value={careerInformation.awardsCount} />
      <StatCard label="Movies Directed" value={careerInformation.moviesDirected} />
      <StatCard label="Total Earnings" value={formatCurrency(careerInformation.totalEarnings)} />
      <StatCard label="Career Length" value={`${careerInformation.careerLength} years`} />
      <StatCard label="Average Rating" value={statistics.averageRating} />
    </div>
  );

  const renderCareer = () => (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6">
        <h2 className="text-xl font-bold text-white">Studios Worked With</h2>
        {careerInformation.studiosWorkedWith.length === 0 ? (
          <p className="mt-4 text-slate-400">No studio history yet.</p>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            {careerInformation.studiosWorkedWith.map((studio) => (
              <span
                key={studio}
                className="rounded-full bg-violet-500/20 px-3 py-1 text-sm text-violet-300"
              >
                {studio}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6">
        <h2 className="text-xl font-bold text-white">Salary History</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="py-3">Week</th>
                <th className="py-3">Salary</th>
                <th className="py-3">Reason</th>
              </tr>
            </thead>
            <tbody className="text-slate-200">
              {salaryHistory.map((entry, index) => (
                <tr key={`${entry.week}-${index}`} className="border-t border-slate-800">
                  <td className="py-3">{entry.week}</td>
                  <td className="py-3">{formatCurrency(entry.salary)}</td>
                  <td className="py-3">{entry.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderStatistics = () => (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      <StatCard label="Hit Movies" value={statistics.hitMovies} />
      <StatCard label="Flop Movies" value={statistics.flopMovies} />
      <StatCard label="Hit Rate" value={formatPercent(statistics.hitRate)} />
      <StatCard label="Flop Rate" value={formatPercent(statistics.flopRate)} />
      <StatCard label="Average Rating" value={statistics.averageRating} />
      <StatCard label="Average Box Office" value={formatCurrency(statistics.averageBoxOffice)} />
    </div>
  );

  const renderAwards = () => {
    if (awards.length === 0) {
      return <EmptyState message="No awards yet." />;
    }

    return (
      <div className="grid gap-4 md:grid-cols-2">
        {awards.map((award, index) => (
          <div key={`${award.awardName}-${index}`} className="rounded-2xl border border-slate-800 bg-[#111827] p-5">
            <h3 className="text-lg font-bold text-white">{award.awardName}</h3>
            <p className="mt-2 text-slate-400">{award.category}</p>
            <p className="mt-3 text-sm text-slate-300">
              {award.movie} • Year {award.year}
            </p>
          </div>
        ))}
      </div>
    );
  };

  const renderFilmography = () => {
    if (careerTimeline.length === 0) {
      return <EmptyState message="No directed movies yet." />;
    }

    return (
      <div className="space-y-4">
        {careerTimeline.map((movie, index) => (
          <div key={`${movie.movieName}-${index}`} className="rounded-2xl border border-slate-800 bg-[#111827] p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">{movie.movieName}</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Year {movie.year} • {movie.studio} • {movie.genre}
                </p>
              </div>
              <span className="rounded-full bg-slate-700 px-3 py-1 text-sm text-slate-200">
                {movie.verdict}
              </span>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <StatCard label="Critic Score" value={movie.criticScore} />
              <StatCard label="Audience Score" value={movie.audienceScore} />
              <StatCard label="Box Office" value={formatCurrency(movie.boxOffice)} />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "Career":
        return renderCareer();
      case "Statistics":
        return renderStatistics();
      case "Awards":
        return renderAwards();
      case "Filmography":
        return renderFilmography();
      default:
        return renderOverview();
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Link to="/directors" className="text-violet-400 hover:text-violet-300">
          ← Back to Directors
        </Link>

        <div className="rounded-3xl border border-slate-800 bg-linear-to-br from-[#0f172a] via-[#111827] to-[#0b1120] p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <img
              src={avatar}
              alt={personalInformation.name}
              className="h-28 w-28 rounded-full border border-slate-700 bg-slate-800"
            />

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-4xl font-bold text-white">{personalInformation.name}</h1>
                <span className="rounded-full bg-violet-500/20 px-3 py-1 text-xs font-bold text-violet-300">
                  {personalInformation.rarity}
                </span>
              </div>

              <p className="mt-2 text-slate-400">
                Age {Math.floor(Number(personalInformation.age || 0))} • {personalInformation.currentStatus}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {personalInformation.genreExpertise.map((genre) => (
                  <span
                    key={genre}
                    className="rounded-full bg-slate-700 px-3 py-1 text-sm text-slate-200"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-xl px-5 py-3 font-semibold transition ${
                activeTab === tab
                  ? "bg-violet-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {renderActiveTab()}
      </div>
    </DashboardLayout>
  );
};

export default DirectorProfile;
