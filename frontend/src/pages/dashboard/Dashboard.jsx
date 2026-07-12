import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  DollarSign,
  Star,
  Users,
  Building,
  Calendar,
  Film,
  TrendingUp,
  Trophy,
  Clock,
  Zap,
  CheckCircle2
} from "lucide-react";

import api from "../../api/axios";
import { setUser } from "../../features/auth/authSlice";
import { setCurrentWeek } from "../../features/simulation/simulationSlice";

import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/common/StatCard";
import SimulationSummaryModal from "../../components/simulation/SimulationSummaryModal";

const Dashboard = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [simulationSummary, setSimulationSummary] = useState(null);
  const [customWeeks, setCustomWeeks] = useState(1);
  const [notifications, setNotifications] = useState([]);
  const { user } = useSelector((state) => state.auth);

  const currentWeek = user?.currentWeek || 1;
  const currentYear = Math.floor((currentWeek - 1) / 52) + 1;
  const currentWeekInYear = ((currentWeek - 1) % 52) + 1;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        dispatch(setUser(res.data.user));
      } catch (error) {
        console.error(error);
      }
    };

    const fetchNotifications = async () => {
      try {
        const res = await api.get("/notifications");
        setNotifications(res.data.notifications || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUser();
    fetchNotifications();
  }, [dispatch]);

  const runSimulation = async (weeks) => {
    if (loading) return;
    try {
      setLoading(true);
      const res = await api.post("/simulation/next-week", { weeks });
      setSimulationSummary(res.data.summary);
      setShowSummary(true);

      // Refresh user data to show new stats
      const userRes = await api.get("/auth/me");
      dispatch(setUser(userRes.data.user));
      
      // Refresh notifications
      const notifRes = await api.get("/notifications");
      setNotifications(notifRes.data.notifications || []);
    } catch (error) {
      const msg = error?.message || error?.response?.data?.message || "Simulation failed";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (message) => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('movie') || lowerMessage.includes('film')) return <Film className="text-violet-400" size={20} />;
    if (lowerMessage.includes('prestige') || lowerMessage.includes('award')) return <Trophy className="text-yellow-400" size={20} />;
    if (lowerMessage.includes('money') || lowerMessage.includes('profit')) return <TrendingUp className="text-green-400" size={20} />;
    if (lowerMessage.includes('fan')) return <Users className="text-blue-400" size={20} />;
    if (lowerMessage.includes('week') || lowerMessage.includes('simulation')) return <Calendar className="text-purple-400" size={20} />;
    return <CheckCircle2 className="text-slate-400" size={20} />;
  };

  const recentEvents = notifications.length > 0 
    ? notifications.slice(0, 5) 
    : [
        { _id: '1', message: '🎬 Welcome to CineVerse Empire', createdAt: new Date().toISOString(), read: false },
        { _id: '2', message: '🏢 Studio Founded', createdAt: new Date().toISOString(), read: false },
        { _id: '3', message: '📅 Week 1 Started', createdAt: new Date().toISOString(), read: false }
      ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Hero Banner */}
        <div className="rounded-3xl bg-linear-to-r from-violet-700 to-purple-500 p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
            Build Your Dream Studio
          </h1>

          <p className="text-slate-100 mt-2 text-sm sm:text-base">
            Create Blockbusters. Become a Legend.
          </p>
        </div>

        {/* Advanced Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-[#111827] p-4 sm:p-6 rounded-2xl border border-slate-800">
          <div className="text-slate-400 font-bold uppercase text-xs tracking-widest">Advanced Controls</div>

          <div className="flex gap-2 flex-wrap">
            {[1, 3, 5].map(w => (
              <button
                key={w}
                disabled={loading}
                onClick={() => runSimulation(w)}
                className="bg-slate-800 hover:bg-violet-600 text-white px-3 py-2 sm:px-4 rounded-xl font-bold transition disabled:opacity-50 text-sm sm:text-base cursor-pointer"
              >
                +{w} {w === 1 ? 'Week' : 'Weeks'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-slate-800 pt-4 sm:pt-0 sm:pl-4 w-full sm:w-auto">
            <input
              type="number"
              min="1"
              max="52"
              value={customWeeks}
              onChange={(e) => setCustomWeeks(e.target.value)}
              className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold outline-none focus:border-violet-500 text-sm sm:text-base"
            />
            <button
              disabled={loading}
              onClick={() => runSimulation(customWeeks)}
              className="flex-1 sm:flex-none bg-violet-600 hover:bg-violet-700 text-white px-4 sm:px-5 py-2 rounded-xl font-bold transition disabled:opacity-50 text-sm sm:text-base cursor-pointer"
            >
              {loading ? "Simulating..." : "Run Custom"}
            </button>
          </div>
        </div>

        {/* Timeline Display */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 sm:p-6 flex justify-between items-center">
            <div className="flex items-center gap-3 sm:gap-4">
                <div className="bg-violet-600/20 text-violet-400 p-2.5 sm:p-3 rounded-xl shrink-0"><Calendar size={20} className="sm:w-6 sm:h-6" /></div>
                <div>
                    <div className="text-white font-black text-lg sm:text-xl md:text-2xl tracking-tighter">YEAR {currentYear} • WEEK {currentWeekInYear}</div>
                    <div className="text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest">Global Industry Timeline</div>
                </div>
            </div>
            <div className="hidden md:block w-64 bg-slate-800 h-2 rounded-full overflow-hidden shrink-0">
                <div
                    className="bg-violet-500 h-full transition-all duration-1000"
                    style={{ width: `${(currentWeekInYear / 52) * 100}%` }}
                />
            </div>
        </div>

        {/* Studio Overview Redesigned */}
        <div className="bg-[#111827] rounded-2xl p-4 sm:p-6 border border-slate-800">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Building className="text-violet-400" />
            Studio Overview
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Studio Name Card */}
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700 hover:border-violet-500 transition">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-violet-600/20 p-2 rounded-lg">
                  <Building className="text-violet-400" size={20} />
                </div>
                <span className="text-slate-400 text-sm font-medium">Studio Name</span>
              </div>
              <h3 className="text-xl font-bold text-white truncate">{user?.studio?.name || 'My Studio'}</h3>
            </div>

            {/* Money Card */}
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700 hover:border-green-500 transition">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-green-600/20 p-2 rounded-lg">
                  <DollarSign className="text-green-400" size={20} />
                </div>
                <span className="text-slate-400 text-sm font-medium">Money</span>
              </div>
              <h3 className="text-xl font-bold text-white truncate">₹{user?.studio?.money?.toLocaleString() || 0}</h3>
            </div>

            {/* Prestige Card */}
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700 hover:border-yellow-500 transition">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-yellow-600/20 p-2 rounded-lg">
                  <Star className="text-yellow-400" size={20} />
                </div>
                <span className="text-slate-400 text-sm font-medium">Prestige</span>
              </div>
              <h3 className="text-xl font-bold text-white truncate">{user?.studio?.prestige?.toLocaleString() || 0}</h3>
            </div>

            {/* Fans Card */}
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700 hover:border-blue-500 transition">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-blue-600/20 p-2 rounded-lg">
                  <Users className="text-blue-400" size={20} />
                </div>
                <span className="text-slate-400 text-sm font-medium">Fans</span>
              </div>
              <h3 className="text-xl font-bold text-white truncate">{user?.studio?.fans?.toLocaleString() || 0}</h3>
            </div>

            {/* Studio Level Card */}
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700 hover:border-purple-500 transition">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-purple-600/20 p-2 rounded-lg">
                  <Zap className="text-purple-400" size={20} />
                </div>
                <span className="text-slate-400 text-sm font-medium">Level</span>
              </div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="bg-violet-600 px-2 py-0.5 rounded text-sm">{user?.studio?.studioLevel || 1}</span>
              </h3>
            </div>
          </div>
        </div>

        {/* Recent Events Timeline */}
        <div className="bg-[#111827] rounded-2xl p-4 sm:p-6 border border-slate-800">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Clock className="text-violet-400" />
            Recent Events
          </h2>
          
          <div className="space-y-4">
            {recentEvents.map((event, index) => (
              <div 
                key={event._id} 
                className="flex gap-4 items-start hover:bg-slate-900/30 p-3 rounded-xl transition cursor-pointer"
              >
                <div className={`flex-shrink-0 mt-1 ${event.read ? 'bg-slate-800' : 'bg-violet-600/30'} p-2 rounded-full`}>
                  {getEventIcon(event.message)}
                </div>
                
                <div className="flex-1 border-l-2 border-slate-700 pl-4">
                  <p className="text-white font-medium text-sm sm:text-base">
                    {event.message}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(event.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showSummary && (
        <SimulationSummaryModal
          summary={simulationSummary}
          onClose={() => setShowSummary(false)}
        />
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
