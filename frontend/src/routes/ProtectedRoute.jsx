import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { refreshAuthSession } from "../api/axios";
import { logout } from "../features/auth/authSlice";

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const [checkingSession, setCheckingSession] = useState(!token);

  useEffect(() => {
    let isMounted = true;

    const recoverSession = async () => {
      if (token) {
        setCheckingSession(false);
        return;
      }

      try {
        setCheckingSession(true);
        await refreshAuthSession();
      } catch (error) {
        console.error(error);
        dispatch(logout());
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
  }, [dispatch, token]);

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617] text-slate-300">
        Restoring session...
      </div>
    );
  }

  if (!localStorage.getItem("token")) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
