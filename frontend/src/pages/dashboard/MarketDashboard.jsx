import { useEffect, useState } from "react";
import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import { TrendingUp, Activity, AlertTriangle, Info, Clock, Calendar } from "lucide-react";

const MarketDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMarketIntelligence = async () => {
    try {
      const res = await api.get("/simulation/market-intelligence");
      setData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketIntelligence();
    // Poll every 10 seconds to auto-refresh while on the page
    const interval = setInterval(fetchMarketIntelligence, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-white text-center py-20 font-bold tracking-widest uppercase">
          Gathering Intelligence...
        </div>
      </DashboardLayout>
    );
  }

  if (!data) return null;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <Activity className="text-blue-500" size={40} /> Market Intelligence
          </h1>
          <p className="text-slate-400 mt-2">
            Real-time industry tracking and competitor analysis. Use these insights to time your releases and tailor your scripts.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Active Trends Section */}
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 md:p-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="text-green-500" /> Active Genre Trends
            </h2>
            
            {(!data.marketTrends.activeTrends || data.marketTrends.activeTrends.length === 0) ? (
              <div className="text-slate-500 italic p-4 bg-slate-900/50 rounded-xl border border-slate-800 text-center">
                The market is currently stable. No dominant trends.
              </div>
            ) : (
              <div className="space-y-4">
                {data.marketTrends.activeTrends.map((trend, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group">
                    <div className={`absolute top-0 right-0 w-2 h-full ${trend.modifier > 1 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-white font-bold text-lg">{trend.genre}</div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                          <Clock size={12} /> {trend.weeksRemaining} weeks remaining
                        </div>
                      </div>
                      <div className={`text-2xl font-black ${trend.modifier > 1 ? 'text-green-500' : 'text-red-500'}`}>
                        {trend.modifier > 1 ? '+' : ''}{Math.round((trend.modifier - 1) * 100)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-6 flex items-start gap-3 text-xs text-slate-500 bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                <Info className="text-blue-500 shrink-0 mt-0.5" size={16} />
                <p>Movies released while a positive trend is active will receive a substantial box office boost. Releasing a movie during a negative trend will cripple its potential.</p>
            </div>
          </div>

          {/* Recent Industry Events Section */}
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 md:p-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <AlertTriangle className="text-yellow-500" /> Recent Industry Events
            </h2>
            
            {data.randomEvents.length === 0 ? (
              <div className="text-slate-500 italic p-4 bg-slate-900/50 rounded-xl border border-slate-800 text-center">
                No recent major disruptions.
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                {data.randomEvents.map((event, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                    <div className="flex justify-between items-start gap-4">
                      <p className="text-slate-300 font-medium text-sm leading-snug">
                        {event.label}
                      </p>
                      <span className="text-xs font-bold text-slate-500 bg-slate-800 px-2 py-1 rounded-md shrink-0 whitespace-nowrap">
                        Week {event.week}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default MarketDashboard;
