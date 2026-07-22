/**
 * @fileoverview Box Office Analytics Page Component
 * 
 * Provides interactive visualization of regional box office distribution, seat occupancy,
 * and theatrical market split.
 */

import React, { useState, useEffect } from "react";
import axios from "../../api/axios";

const BoxOfficeAnalytics = ({ movieId }) => {
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!movieId) return;
    const fetchTelemetry = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/box-office/analytics/${movieId}`);
        setTelemetry(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load box office telemetry");
      } finally {
        setLoading(false);
      }
    };
    fetchTelemetry();
  }, [movieId]);

  if (loading) return <div className="p-4 text-center text-slate-400">Loading box office analytics...</div>;
  if (error) return <div className="p-4 text-center text-rose-500">{error}</div>;
  if (!telemetry) return null;

  const { regionalBreakdown, profitMargin, occupancyEfficiency } = telemetry;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white">{telemetry.title} — Box Office Telemetry</h2>
          <p className="text-sm text-slate-400">Territory Distribution & Occupancy Breakdown</p>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Profit Margin</span>
            <span className={`text-lg font-bold ${profitMargin >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {profitMargin}%
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Occupancy Rate</span>
            <span className="text-lg font-bold text-amber-400">{occupancyEfficiency}%</span>
          </div>
        </div>
      </div>

      {/* Regional Bars */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {regionalBreakdown && Object.entries(regionalBreakdown).map(([region, gross]) => (
          <div key={region} className="bg-slate-800/60 p-4 rounded-lg border border-slate-700/50">
            <span className="text-xs uppercase font-semibold text-indigo-400 block mb-1">
              {region.replace(/([A-Z])/g, " $1")}
            </span>
            <span className="text-lg font-bold text-white">
              ₹{(gross / 1000000).toFixed(2)}M
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BoxOfficeAnalytics;
