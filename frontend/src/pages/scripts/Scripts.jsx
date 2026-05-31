import { useCallback, useEffect, useState } from "react";

import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";

const Scripts = () => {
  const [scripts, setScripts] = useState([]);
  const [ownedScripts, setOwnedScripts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("market");

  const fetchMarketScripts = useCallback(async () => {
    try {
      const res = await api.get("/scripts");
      setScripts(res.data.scripts || []);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchOwnedScripts = useCallback(async () => {
    try {
      const res = await api.get("/scripts/owned");
      setOwnedScripts(res.data.scripts || []);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const loadScripts = useCallback(async () => {
    try {
      setInitialLoading(true);
      await Promise.all([fetchMarketScripts(), fetchOwnedScripts()]);
    } finally {
      setInitialLoading(false);
    }
  }, [fetchMarketScripts, fetchOwnedScripts]);

  useEffect(() => {
    loadScripts();
  }, [loadScripts]);

  const generateScripts = async () => {
    try {
      setLoading(true);
      const res = await api.post("/scripts/generate");
      setScripts(res.data.scripts || []);
      setActiveTab("market");
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Failed to generate scripts");
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (index) => {
    try {
      await api.post(`/scripts/buy/${index}`);
      await Promise.all([fetchMarketScripts(), fetchOwnedScripts()]);
      alert("Script Purchased");
      setActiveTab("owned");
    } catch (error) {
      alert(error?.response?.data?.message || "Purchase Failed");
    }
  };

  const handleSell = async (index) => {
    try {
      await api.post(`/scripts/sell/${index}`);
      await Promise.all([fetchMarketScripts(), fetchOwnedScripts()]);
      alert("Script Sold");
      setActiveTab("market");
    } catch (error) {
      alert(error?.response?.data?.message || "Sell Failed");
    }
  };

  const renderMarket = () => {
    if (scripts.length === 0) {
      return (
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            No Scripts Available
          </h2>
          <p className="text-slate-400">
            Click Generate 5 Scripts to create a new market batch.
          </p>
        </div>
      );
    }

    const rarityStyles = {
      Common: "bg-slate-500/20 text-slate-300 border border-slate-500/30",

      Uncommon:
        "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",

      Rare: "bg-sky-500/20 text-sky-300 border border-sky-500/30",

      Epic: "bg-violet-500/20 text-violet-300 border border-violet-500/30",

      Legendary: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    };

    const cardStyles = {
      Common: "hover:border-slate-500",
      Uncommon: "hover:border-emerald-500",
      Rare: "hover:border-sky-500",
      Epic: "hover:border-violet-500",
      Legendary: "hover:border-amber-500",
    };

    return (
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {scripts.map((script, index) => (
          <div
            key={`${script.title}-${index}`}
            className={`group relative overflow-hidden
                      bg-linear-to-br
                      from-[#0f172a]
                      via-[#111827]
                      to-[#0b1120]
                      border border-slate-800
                      rounded-3xl
                      p-6
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      ${cardStyles[script.rarity]}`}
          >
            <div className="flex justify-between items-center mb-4">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${rarityStyles[script.rarity]}`}
              >
                {script.rarity || "Common"}
              </span>
            </div>

            <h2 className="text-xl font-bold text-white">{script.title}</h2>

            <div className="flex flex-wrap gap-2 mt-3">
              {script.genres?.map((genre, genreIndex) => (
                <span
                  key={`${genre}-${genreIndex}`}
                  className="bg-violet-500/20 text-violet-300 px-3 py-1 rounded-full text-xs"
                >
                  {genre}
                </span>
              ))}
            </div>

            <div className="mt-5 space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span>Quality</span>
                <span>{script.quality}</span>
              </div>

              <div className="flex justify-between">
                <span>Originality</span>
                <span>{script.originality}</span>
              </div>

              <div className="flex justify-between">
                <span>Audience</span>
                <span>{script.audienceAppeal}</span>
              </div>

              <div className="flex justify-between">
                <span>Franchise</span>
                <span>{script.franchisePotential}</span>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-green-400 text-xl font-bold">
                ₹{script.price?.toLocaleString()}
              </p>

              <button
                onClick={() => handleBuy(index)}
                className="mt-3 w-full bg-violet-600 hover:bg-violet-700 py-3 rounded-xl text-white font-semibold transition"
              >
                Buy Script
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderOwned = () => {
    if (ownedScripts.length === 0) {
      return (
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            No Owned Scripts
          </h2>
          <p className="text-slate-400">
            Buy scripts from the market to see them here.
          </p>
        </div>
      );
    }

    return (
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {ownedScripts.map((script, index) => (
          <div
            key={`${script.title}-${index}`}
            className="bg-[#111827] border border-slate-800 rounded-2xl p-5 hover:border-green-500 transition"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs font-semibold">
                Owned
              </span>
              <span className="bg-slate-700 text-slate-200 px-3 py-1 rounded-full text-xs font-semibold">
                {script.rarity || "Common"}
              </span>
            </div>

            <h2 className="text-xl font-bold text-white">{script.title}</h2>

            <div className="flex flex-wrap gap-2 mt-3">
              {script.genres?.map((genre, genreIndex) => (
                <span
                  key={`${genre}-${genreIndex}`}
                  className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs"
                >
                  {genre}
                </span>
              ))}
            </div>

            <div className="mt-5 space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span>Quality</span>
                <span>{script.quality}</span>
              </div>

              <div className="flex justify-between">
                <span>Originality</span>
                <span>{script.originality}</span>
              </div>

              <div className="flex justify-between">
                <span>Audience</span>
                <span>{script.audienceAppeal}</span>
              </div>

              <div className="flex justify-between">
                <span>Franchise</span>
                <span>{script.franchisePotential}</span>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <p className="text-green-400 font-bold">
                Buy: ₹{script.price?.toLocaleString()}
              </p>
              <p className="text-orange-400 font-bold">
                Sell: ₹{script.sellPrice?.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500">
                Purchased:{" "}
                {script.purchasedAt
                  ? new Date(script.purchasedAt).toLocaleDateString()
                  : "-"}
              </p>

              <button
                onClick={() => handleSell(index)}
                className="mt-3 w-full bg-red-600 hover:bg-red-700 py-3 rounded-xl text-white font-semibold transition"
              >
                Sell Script
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">Scripts</h1>
            <p className="text-slate-400 mt-2">
              Generate market scripts, buy them, and manage your owned
              inventory.
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

            {activeTab === "market" && (
              <button
                onClick={generateScripts}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:cursor-not-allowed px-5 py-3 rounded-xl text-white font-semibold transition"
              >
                {loading ? "Generating..." : "Generate 5 Scripts"}
              </button>
            )}
          </div>
        </div>

        {initialLoading ? (
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-12 text-center">
            <h2 className="text-2xl font-bold text-white">Loading...</h2>
          </div>
        ) : (
          <>{activeTab === "market" ? renderMarket() : renderOwned()}</>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Scripts;
