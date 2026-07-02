import { Link } from "react-router-dom";
import { ArrowLeft, ShieldAlert, Sparkles, Building2 } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";

const RivalIntelligence = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <Link to="/rival-studios" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition">
          <ArrowLeft size={16} /> Back to Rivals Market
        </Link>

        <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-red-950/40 border border-red-900/60 rounded-2xl flex items-center justify-center mx-auto text-rose-500">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">Espionage Headquarters</h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
            Purchase intel dossiers inside the main Rivals view to reveal proprietary details on scripts in development, cash reserves, and release trajectories.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RivalIntelligence;
