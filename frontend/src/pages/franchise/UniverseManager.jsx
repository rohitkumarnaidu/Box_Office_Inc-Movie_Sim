/**
 * @fileoverview Universe Manager Page Component
 * 
 * Manages cinematic universe connections, spin-offs, crossovers, and fatigue meters.
 */

import React, { useState, useEffect } from "react";
import axios from "../../api/axios";

const UniverseManager = ({ franchiseId }) => {
  const [synergy, setSynergy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!franchiseId) return;
    const fetchSynergy = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/franchises/universe-synergy/${franchiseId}`);
        setSynergy(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSynergy();
  }, [franchiseId]);

  if (loading) return <div className="p-4 text-center text-slate-400">Loading universe data...</div>;
  if (!synergy) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
      <h3 className="text-lg font-bold text-white">Cinematic Universe: {synergy.name}</h3>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
          <span className="text-xs text-slate-400 block">Fanbase Multiplier</span>
          <span className="text-lg font-bold text-indigo-400">{synergy.fanbaseMultiplier}x</span>
        </div>
        <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
          <span className="text-xs text-slate-400 block">Prestige Bonus</span>
          <span className="text-lg font-bold text-amber-400">+{synergy.prestigeBonus}</span>
        </div>
        <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
          <span className="text-xs text-slate-400 block">Crossover Multiplier</span>
          <span className="text-lg font-bold text-emerald-400">{synergy.crossoverBonusMultiplier}x</span>
        </div>
      </div>
    </div>
  );
};

export default UniverseManager;
