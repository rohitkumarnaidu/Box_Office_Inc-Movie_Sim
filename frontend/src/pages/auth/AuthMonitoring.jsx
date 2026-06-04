import { useCallback, useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

import api from "../../api/axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/common/StatCard";

const eventLabels = {
  LOGIN_SUCCESS: "Login Success",
  LOGIN_FAILURE: "Login Failure",
  LOGOUT: "Logout",
  TOKEN_REFRESH_SUCCESS: "Token Refresh",
  TOKEN_REFRESH_FAILURE: "Refresh Failure",
  AUTH_FAILURE: "Auth Failure",
  SESSION_EXPIRED: "Session Expired",
};

const AuthMonitoring = () => {
  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState({ total: 0, byType: {}, byReason: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDiagnostics = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/auth/diagnostics?limit=75");

      setEvents(res.data.events || []);
      setSummary(res.data.summary || { total: 0, byType: {}, byReason: {} });
    } catch (requestError) {
      console.error(requestError);
      setError("Unable to load authentication diagnostics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const refreshTimer = window.setTimeout(fetchDiagnostics, 0);

    return () => window.clearTimeout(refreshTimer);
  }, [fetchDiagnostics]);

  const successCount = summary.byType?.LOGIN_SUCCESS || 0;
  const refreshCount = summary.byType?.TOKEN_REFRESH_SUCCESS || 0;
  const failureCount =
    (summary.byType?.LOGIN_FAILURE || 0) +
    (summary.byType?.TOKEN_REFRESH_FAILURE || 0) +
    (summary.byType?.AUTH_FAILURE || 0);
  const expirationCount = summary.byType?.SESSION_EXPIRED || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">Auth Monitoring</h1>
            <p className="mt-2 text-slate-400">
              Track logins, logouts, token refreshes, failures, and session
              expiration reasons.
            </p>
          </div>

          <button
            onClick={fetchDiagnostics}
            disabled={loading}
            className="rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:bg-slate-700"
          >
            {loading ? "Refreshing..." : "Refresh Diagnostics"}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Login Events"
            value={successCount}
            icon={<ShieldCheck />}
          />
          <StatCard
            title="Refresh Events"
            value={refreshCount}
            icon={<ShieldCheck />}
          />
          <StatCard
            title="Failures"
            value={failureCount}
            icon={<ShieldCheck />}
          />
          <StatCard
            title="Session Expirations"
            value={expirationCount}
            icon={<ShieldCheck />}
          />
        </div>

        {error && (
          <div className="rounded-2xl border border-red-900 bg-red-950/40 p-4 text-red-200">
            {error}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1fr_2fr]">
          <div className="rounded-3xl border border-slate-800 bg-[#111827] p-6">
            <h2 className="mb-4 text-xl font-bold text-white">
              Failure Reasons
            </h2>

            <div className="space-y-3">
              {Object.keys(summary.byReason || {}).length === 0 && (
                <p className="text-slate-400">No failure reasons recorded.</p>
              )}

              {Object.entries(summary.byReason || {}).map(([reason, count]) => (
                <div
                  key={reason}
                  className="flex items-center justify-between rounded-xl bg-slate-900 p-3 text-slate-300"
                >
                  <span>{reason}</span>
                  <span className="font-bold text-white">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-[#111827] p-6">
            <h2 className="mb-4 text-xl font-bold text-white">
              Recent Authentication Events
            </h2>

            {loading ? (
              <p className="text-slate-400">Loading diagnostics...</p>
            ) : events.length === 0 ? (
              <p className="text-slate-400">No authentication events found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="text-slate-400">
                    <tr>
                      <th className="border-b border-slate-800 p-3">Event</th>
                      <th className="border-b border-slate-800 p-3">Reason</th>
                      <th className="border-b border-slate-800 p-3">IP</th>
                      <th className="border-b border-slate-800 p-3">When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr key={event._id} className="text-slate-300">
                        <td className="border-b border-slate-900 p-3 font-semibold text-white">
                          {eventLabels[event.eventType] || event.eventType}
                        </td>
                        <td className="border-b border-slate-900 p-3">
                          {event.reason || "-"}
                        </td>
                        <td className="border-b border-slate-900 p-3">
                          {event.ipAddress || "-"}
                        </td>
                        <td className="border-b border-slate-900 p-3">
                          {event.createdAt
                            ? new Date(event.createdAt).toLocaleString()
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AuthMonitoring;
