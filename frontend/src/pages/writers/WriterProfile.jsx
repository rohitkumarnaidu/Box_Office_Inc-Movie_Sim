import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString()}`;

const WriterProfile = () => {
  const { writerId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get(`/writers/${writerId}/profile`);

      setProfile(res.data.profile);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load writer profile");
    } finally {
      setLoading(false);
    }
  }, [writerId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProfile();
  }, [loadProfile]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-12 text-center">
          <h2 className="text-2xl font-bold text-white">Loading profile...</h2>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !profile) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <Link to="/writers" className="text-violet-400 hover:text-violet-300">
            ← Back to Writers
          </Link>
          <div className="bg-[#111827] border border-red-900 rounded-2xl p-12 text-center">
            <h2 className="text-2xl font-bold text-white">{error}</h2>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { personalInfo, career } = profile;
  const avatar = `https://api.dicebear.com/7.x/personas/svg?seed=${personalInfo.avatarSeed}`;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Link to="/writers" className="text-violet-400 hover:text-violet-300">
          ← Back to Writers
        </Link>

        <div className="rounded-3xl border border-slate-800 bg-linear-to-br from-[#0f172a] via-[#111827] to-[#0b1120] p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <img
              src={avatar}
              alt={personalInfo.name}
              className="h-28 w-28 rounded-full border border-slate-700 bg-slate-800"
            />

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-4xl font-bold text-white">
                  {personalInfo.name}
                </h1>
                <span className="rounded-full bg-violet-500/20 px-3 py-1 text-xs font-bold text-violet-300">
                  {personalInfo.rarity}
                </span>
              </div>

              <p className="mt-2 text-slate-400">
                Age {Math.floor(personalInfo.age)} • {personalInfo.status}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {personalInfo.genres.map((genre) => (
                  <span
                    key={genre}
                    className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5">
            <p className="text-sm text-slate-400">Total Scripts</p>
            <p className="mt-2 text-3xl font-bold text-white">
              {career.totalScripts}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5">
            <p className="text-sm text-slate-400">Hits / Flops</p>
            <p className="mt-2 text-3xl font-bold text-white">
              {career.hits} / {career.flops}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5">
            <p className="text-sm text-slate-400">Hit Rate</p>
            <p className="mt-2 text-3xl font-bold text-white">
              {career.hitRate}%
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5">
            <p className="text-sm text-slate-400">Average Quality</p>
            <p className="mt-2 text-3xl font-bold text-white">
              {career.averageQuality}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-800 bg-[#111827] p-6">
            <h2 className="text-2xl font-bold text-white">Career</h2>

            <div className="mt-5 space-y-3 text-slate-300">
              <div className="flex justify-between">
                <span>Awards</span>
                <span>{career.awards}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Earnings</span>
                <span>{formatCurrency(career.totalEarnings)}</span>
              </div>
              <div>
                <p className="mb-2 text-slate-400">Studios Worked With</p>
                <div className="flex flex-wrap gap-2">
                  {career.studiosWorkedWith.length === 0 ? (
                    <span className="text-slate-500">No completed studio work yet.</span>
                  ) : (
                    career.studiosWorkedWith.map((studio) => (
                      <span
                        key={studio}
                        className="rounded-full bg-violet-500/20 px-3 py-1 text-xs text-violet-300"
                      >
                        {studio}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-[#111827] p-6">
            <h2 className="text-2xl font-bold text-white">Salary History</h2>

            <div className="mt-5 space-y-3">
              {career.salaryHistory.map((entry, index) => (
                <div
                  key={`${entry.reason}-${entry.week}-${index}`}
                  className="flex justify-between rounded-xl bg-slate-900 p-3 text-slate-300"
                >
                  <span>Week {entry.week}</span>
                  <span>{formatCurrency(entry.salary)}</span>
                  <span className="text-slate-500">{entry.reason}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="rounded-2xl border border-slate-800 bg-[#111827] p-6">
          <h2 className="text-2xl font-bold text-white">Awards</h2>

          <div className="mt-5 space-y-3">
            {career.awardsHistory.length === 0 ? (
              <p className="text-slate-500">No awards won yet.</p>
            ) : (
              career.awardsHistory.map((award, index) => (
                <div
                  key={`${award.awardName}-${award.scriptName}-${index}`}
                  className="rounded-xl bg-slate-900 p-4 text-slate-300"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{award.awardName}</p>
                      <p className="text-sm text-slate-400">
                        {award.scriptName} • {award.genre} • Week {award.week}
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300">
                      +{award.reputationGain} Rep
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-[#111827] p-6">
          <h2 className="text-2xl font-bold text-white">Scripts Written</h2>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-slate-500">
                <tr>
                  <th className="pb-3">Script</th>
                  <th className="pb-3">Studio</th>
                  <th className="pb-3">Week</th>
                  <th className="pb-3">Genre</th>
                  <th className="pb-3">Quality</th>
                </tr>
              </thead>
              <tbody>
                {career.scripts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-slate-500">
                      No completed scripts yet.
                    </td>
                  </tr>
                ) : (
                  career.scripts.map((script, index) => (
                    <tr key={`${script.scriptName}-${index}`} className="border-t border-slate-800">
                      <td className="py-3">{script.scriptName}</td>
                      <td className="py-3">{script.studioName}</td>
                      <td className="py-3">{script.completionWeek}</td>
                      <td className="py-3">{script.genre}</td>
                      <td className="py-3">{script.scriptQuality}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default WriterProfile;
