import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { isRefreshSessionRejected, refreshAuthSession } from "../api/axios";
import { logout } from "../features/auth/authSlice";

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const [checkingSession, setCheckingSession] = useState(!token);
  const [sessionRecoveryError, setSessionRecoveryError] = useState(false);
  const [sessionRejected, setSessionRejected] = useState(false);
  const [recoveryAttempt, setRecoveryAttempt] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const recoverSession = async () => {
      if (token) {
        setCheckingSession(false);
        setSessionRecoveryError(false);
        return;
      }

      try {
        setCheckingSession(true);
        setSessionRecoveryError(false);
        await refreshAuthSession();
      } catch (error) {
        console.error(error);

        if (isRefreshSessionRejected(error)) {
          dispatch(logout());
          setSessionRejected(true);
          return;
        }

        setSessionRecoveryError(true);
      } finally {
        if (isMounted) {
          setCheckingSession(false);
        }
      }
    };

    recoverSession();

    return () => {
      isMounted = false;
    };
  }, [dispatch, recoveryAttempt, token]);

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617] text-slate-300">
        Restoring session...
      </div>
    );
  }

  if (sessionRecoveryError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#020617] text-slate-300">
        <p>Unable to restore your session right now. Check your connection and try again.</p>
        <button
          onClick={() => {
            setSessionRecoveryError(false);
            setCheckingSession(true);
            setRecoveryAttempt((attempt) => attempt + 1);
          }}
          className="rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-700"
        >
          Retry Session Restore
        </button>
      </div>
    );
  }

  if (sessionRejected || !localStorage.getItem("token")) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
