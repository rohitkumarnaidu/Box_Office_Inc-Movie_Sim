import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import api, { persistAuthSession } from "../../api/axios";

import AuthLayout from "../../layouts/AuthLayout";
import AuthCard from "../../components/common/AuthCard";
import AuthInput from "../../components/common/AuthInput";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      persistAuthSession({
        user: res.data.user,
        token: res.data.token,
        accessTokenExpiresAt: res.data.accessTokenExpiresAt,
      });

      navigate("/");
    } catch (error) {
      console.error(error);
      setError(
        error.response?.data?.message || "Invalid email or password."
      );
    }
  };

  return (
    <AuthLayout>
      <AuthCard title="Welcome Back">
        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            label="Email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <AuthInput
            label="Password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            className="
            w-full
            bg-violet-600
            hover:bg-violet-700
            py-3
            rounded-xl
            font-semibold
            transition
            "
          >
            Enter CineVerse
          </button>

          <p className="text-center text-slate-400">
            Don't have an account?{" "}
            <Link to="/register" className="text-violet-400">
              Register
            </Link>
          </p>
        </form>
      </AuthCard>
    </AuthLayout>
  );
};

export default Login;