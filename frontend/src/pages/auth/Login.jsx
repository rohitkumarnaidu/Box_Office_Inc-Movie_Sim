import { useNavigate, Link } from "react-router-dom";

import api, { persistAuthSession } from "../../api/axios";
import { useAsyncAction } from "../../hooks/useAsyncAction";
import { useFormValidation, required } from "../../hooks/useFormValidation";

import AuthLayout from "../../layouts/AuthLayout";
import AuthCard from "../../components/common/AuthCard";
import AuthInput from "../../components/common/AuthInput";

const Login = () => {
  const navigate = useNavigate();
  const { loading, error, execute } = useAsyncAction();

  const { values, errors, touched, setValue, validate } = useFormValidation(
    { email: "", password: "" },
    {
      email: (v) => {
        if (!v?.trim()) return "Email is required";
        return "";
      },
      password: required("Password is required"),
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    await execute(
      async () => {
        const res = await api.post("/auth/login", {
          email: values.email,
          password: values.password,
        });
        persistAuthSession({
          user: res.data.user,
          token: res.data.token,
          accessTokenExpiresAt: res.data.accessTokenExpiresAt,
        });
        navigate("/");
      },
      { errorMessage: "Invalid email or password." }
    );
  };

  return (
    <AuthLayout>
      <AuthCard title="Welcome Back">
        <form onSubmit={handleSubmit} className="space-y-4">
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
            {loading ? "Signing in..." : "Enter CineVerse"}
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