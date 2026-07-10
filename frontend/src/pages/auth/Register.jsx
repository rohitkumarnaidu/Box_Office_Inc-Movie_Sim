import { Link, useNavigate } from "react-router-dom";

import api, { persistAuthSession } from "../../api/axios";
import { useAsyncAction } from "../../hooks/useAsyncAction";
import { useFormValidation, required } from "../../hooks/useFormValidation";

import AuthLayout from "../../layouts/AuthLayout";
import AuthCard from "../../components/common/AuthCard";
import AuthInput from "../../components/common/AuthInput";

const Register = () => {
  const navigate = useNavigate();
  const { loading, error, execute } = useAsyncAction();

  const { values, errors, touched, setValue, validate } = useFormValidation(
    { username: "", email: "", password: "", studioName: "" },
    {
      username: (v) => {
        if (!v?.trim()) return "Username is required";
        if (v.length < 3) return "Username must be at least 3 characters";
        return "";
      },
      email: (v) => {
        if (!v?.trim()) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Invalid email format";
        return "";
      },
      password: (v) => {
        if (!v) return "Password is required";
        if (v.length < 6) return "Password must be at least 6 characters";
        return "";
      },
      studioName: required("Studio name is required"),
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    await execute(
      async () => {
        const res = await api.post("/auth/register", values);
        persistAuthSession({
          user: res.data.user,
          token: res.data.token,
          accessTokenExpiresAt: res.data.accessTokenExpiresAt,
        });
        navigate("/");
      },
      { errorMessage: "Something went wrong. Please try again." }
    );
  };

  return (
    <AuthLayout>
      <AuthCard title="Create Studio">
        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            label="Username"
            placeholder="Username"
            value={values.username}
            onChange={(e) => setValue("username", e.target.value)}
          />
          {touched.username && errors.username && (
            <p className="text-red-400 text-xs -mt-2">{errors.username}</p>
          )}

          <AuthInput
            label="Email"
            placeholder="Email"
            value={values.email}
            onChange={(e) => setValue("email", e.target.value)}
          />
          {touched.email && errors.email && (
            <p className="text-red-400 text-xs -mt-2">{errors.email}</p>
          )}

          <AuthInput
            label="Password"
            type="password"
            placeholder="Password"
            value={values.password}
            onChange={(e) => setValue("password", e.target.value)}
          />
          {touched.password && errors.password && (
            <p className="text-red-400 text-xs -mt-2">{errors.password}</p>
          )}

          <AuthInput
            label="Studio Name"
            placeholder="Studio Name"
            value={values.studioName}
            onChange={(e) => setValue("studioName", e.target.value)}
          />
          {touched.studioName && errors.studioName && (
            <p className="text-red-400 text-xs -mt-2">{errors.studioName}</p>
          )}

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="
            w-full
            bg-violet-600
            hover:bg-violet-700
            disabled:opacity-50
            py-3
            rounded-xl
            font-semibold
            transition
            "
          >
            {loading ? "Creating..." : "Create Studio"}
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