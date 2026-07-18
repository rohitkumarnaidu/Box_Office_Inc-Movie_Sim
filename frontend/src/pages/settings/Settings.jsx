import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Building2, Save, AlertCircle, CheckCircle } from "lucide-react";

import api, { clearScheduledRefresh } from "../../api/axios";
import { logout } from "../../features/auth/authSlice";
import DashboardLayout from "../../layouts/DashboardLayout";

const Settings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [studioName, setStudioName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudio = async () => {
      try {
        const res = await api.get("/studios/profile");
        setStudioName(res.data.studio.name);
      } catch (err) {
        setError("Failed to load studio details.");
      } finally {
        setLoading(false);
      }
    };
    fetchStudio();
  }, []);

  const handleUpdateStudio = async (e) => {
    e.preventDefault();
    if (!studioName || studioName.trim().length < 3) {
      setError("Studio name must be at least 3 characters.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");
      await api.put("/studios/profile", { name: studioName });
      setSuccess("Studio name updated successfully!");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update studio name.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error(error);
    } finally {
      clearScheduledRefresh();
      dispatch(logout());
      navigate("/login");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-white">Settings</h1>
          <p className="text-slate-400 mt-2">Manage your account and studio settings.</p>
        </div>

        {/* Studio profile card */}
        <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <Building2 className="text-violet-500" size={24} />
            <h2 className="text-xl font-bold text-white">Studio Profile</h2>
          </div>

          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 w-24 bg-slate-800 rounded-lg" />
              <div className="h-12 w-full bg-slate-800 rounded-xl" />
              <div className="h-10 w-32 bg-slate-800 rounded-xl" />
            </div>
          ) : (
            <form onSubmit={handleUpdateStudio} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
                  <CheckCircle size={16} />
                  <span>{success}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-400 text-sm mb-2">Studio Name</label>
                <input
                  type="text"
                  value={studioName}
                  onChange={(e) => setStudioName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-violet-600"
                  placeholder="Enter studio name..."
                  disabled={saving}
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm transition disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          )}
        </div>

        {/* Account actions card */}
        <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6">
          <h2 className="text-xl font-bold text-white mb-5">Account</h2>

          <button
            onClick={handleLogout}
            className="
              w-full
              bg-red-600
              hover:bg-red-700
              py-4
              rounded-2xl
              text-white
              font-semibold
              transition
            "
          >
            Logout
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
