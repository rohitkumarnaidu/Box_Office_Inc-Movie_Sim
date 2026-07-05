import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api, { persistAuthSession } from "../../api/axios";

import AuthLayout from "../../layouts/AuthLayout";
import AuthCard from "../../components/common/AuthCard";
import AuthInput from "../../components/common/AuthInput";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    studioName: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/auth/register", form);

      persistAuthSession({
        user: res.data.user,
        token: res.data.token,
        accessTokenExpiresAt: res.data.accessTokenExpiresAt,
      });

      navigate("/");
    } catch (error) {
      console.error(error);
      setError(
        error.response?.data?.message || "Something went wrong. Please try again."
      );
    }
  };

  return (
    <AuthLayout>
      <AuthCard title="Create Studio">
        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            label="Username"
            placeholder="Username"
            onChange={(e) =>
              setForm({
                ...form,
                username: e.target.value,
              })
            }
          />

          <AuthInput
            label="Email"
            placeholder="Email"
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
          />

          <AuthInput
            label="Password"
            type="password"
            placeholder="Password"
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
          />

          <AuthInput
            label="Studio Name"
            placeholder="Studio Name"
            onChange={(e) =>
              setForm({
                ...form,
                studioName: e.target.value,
              })
            }
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
            Create Studio
          </button>

          <p className="text-center text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="text-violet-400">
              Login
            </Link>
          </p>
        </form>
      </AuthCard>
    </AuthLayout>
  );
};

export default Register;