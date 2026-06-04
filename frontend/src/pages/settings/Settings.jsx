import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";
import { logout } from "../../features/auth/authSlice";
import DashboardLayout from "../../layouts/DashboardLayout";

const Settings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error(error);
    } finally {
      dispatch(logout());
      navigate("/login");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-white">Settings</h1>

          <p className="text-slate-400 mt-2">Manage your account and studio.</p>
        </div>

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
