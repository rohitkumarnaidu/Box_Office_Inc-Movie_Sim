import { useEffect, useState, useCallback } from "react";
import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import { Trophy, TrendingUp, DollarSign, Award, Star } from "lucide-react";

const HistoricRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState("worldwideGross"); // worldwideGross, openingWeekend, roi
  const [error, setError] = useState(null);

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/records?metric=${metric}`);
      setRecords(res.data.records || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load all-time records.");
    } finally {
      setLoading(false);
    }
  }, [metric]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const metrics = [
    { id: "worldwideGross", label: "Worldwide Gross", icon: DollarSign },
    { id: "openingWeekend", label: "Opening Weekend", icon: TrendingUp },
    { id: "roi", label: "Return on Investment (ROI)", icon: Award },
  ];

  const formatValue = (val, met) => {
    if (met === "roi") {
      return `${(val * 100).toFixed(1)}%`;
    }
    return `₹${val.toLocaleString()}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white flex items-center gap-3">
            <Trophy className="text-yellow-500" size={36} /> All-Time Records Board
          </h1>
          <p className="text-slate-400 mt-1 text-sm sm:text-base">
            The hall of fame for the highest grossing, biggest openings, and most profitable films in the industry.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-col sm:flex-row gap-2 bg-[#111827] border border-slate-800 p-1.5 rounded-2xl">
          {metrics.map((m) => {
            const Icon = m.icon;
            const active = metric === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMetric(m.id)}
                className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition cursor-pointer flex-1 ${
                  active
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={16} />
                {m.label}
              </button>
            );
          })}
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="text-white text-center py-20 font-medium">Loading Hall of Fame records...</div>
        ) : error ? (
          <div className="text-red-500 text-center py-20 font-semibold">{error}</div>
        ) : records.length === 0 ? (
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
            <Trophy size={48} className="mx-auto mb-4 opacity-30" />
            <p>No records found yet. Release movies to start charting!</p>
          </div>
        ) : (
          <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <th className="px-6 py-4 text-center w-16">Rank</th>
                    <th className="px-6 py-4">Movie Title</th>
                    <th className="px-6 py-4">Studio</th>
                    <th className="px-6 py-4 text-center">Release Week</th>
                    <th className="px-6 py-4 text-center">Year</th>
                    <th className="px-6 py-4 text-right pr-8">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {records.map((record, index) => {
                    const isPlayer = !record.isRival;
                    const rank = index + 1;
                    return (
                      <tr
                        key={record._id}
                        className={`transition text-sm ${
                          isPlayer
                            ? "bg-violet-500/5 hover:bg-violet-500/10"
                            : "hover:bg-slate-800/30"
                        }`}
                      >
                        <td className="px-6 py-4 text-center font-black text-slate-500">
                          {rank === 1 ? (
                            <span className="text-yellow-500">🥇</span>
                          ) : rank === 2 ? (
                            <span className="text-slate-300">🥈</span>
                          ) : rank === 3 ? (
                            <span className="text-amber-600">🥉</span>
                          ) : (
                            rank
                          )}
                        </td>
                        <td className="px-6 py-4 font-bold text-white">
                          <div className="flex items-center gap-2">
                            {record.title}
                            {isPlayer && (
                              <span className="bg-violet-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                                <Star size={8} fill="white" /> Player
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-300 font-medium">
                          {record.studioName}
                        </td>
                        <td className="px-6 py-4 text-center text-slate-400 font-mono">
                          Week {record.releaseWeek}
                        </td>
                        <td className="px-6 py-4 text-center text-slate-400 font-mono">
                          Year {record.year}
                        </td>
                        <td className="px-6 py-4 text-right pr-8 font-black text-green-400 text-base">
                          {formatValue(
                            metric === "worldwideGross"
                              ? record.worldwideGross
                              : metric === "openingWeekend"
                              ? record.openingWeekend
                              : record.roi,
                            metric
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default HistoricRecords;
