import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import api, { persistAuthSession } from "../../api/axios";
import { useAsyncAction } from "../../hooks/useAsyncAction";
import { useFormValidation, required } from "../../hooks/useFormValidation";

import AuthLayout from "../../layouts/AuthLayout";
import AuthCard from "../../components/common/AuthCard";
import AuthInput from "../../components/common/AuthInput";
import { GoogleLogin } from '@react-oauth/google';
import { useGoogleLoginMutation } from "../../features/auth/authApi";


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
  
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential;
      const res = await googleLoginMutation({ token }).unwrap();

      if (res.requiresStudio) {
        setPendingToken(token); 
        setRequiresStudio(true); 
      } else {
        persistAuthSession({
          user: res.user,
          token: res.token,
          accessTokenExpiresAt: res.accessTokenExpiresAt,
        });
        navigate('/'); 
      }
    } catch (error) {
      console.error("Google Auth Error:", error);
      setError("Google Login Failed.");
    }
  };

  const handleStudioSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await googleLoginMutation({ 
        token: pendingToken, 
        studioName 
      }).unwrap();
      
      dispatch({ type: 'auth/setCredentials', payload: res });
      navigate('/dashboard'); 
    } catch (error) {
      console.error("Failed to create studio:", error);
    }
  };

  return (
    <AuthLayout>
      <AuthCard title="Welcome Back">
        <div className="mb-6 flex flex-col items-center">
          {!requiresStudio ? (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Login Failed')}
              theme="outline"
            />
          ) : (
            <form onSubmit={handleStudioSubmit} className="w-full flex flex-col gap-3 p-4 bg-slate-800 rounded-lg border border-violet-500">
              <h3 className="text-white text-sm text-center">Almost there! What should we call your studio?</h3>
              <input 
                type="text" 
                value={studioName}
                onChange={(e) => setStudioName(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg border border-slate-700 focus:border-violet-500"
              />
              <button 
                type="submit" 
                disabled={isLoading || !studioName}
                className="w-full bg-violet-600 hover:bg-violet-700 py-2 rounded-lg font-semibold text-white transition disabled:opacity-50"
              >
                {isLoading ? "Creating..." : "Finish Account"}
              </button>
            </form>
          )}
        </div>

        {/* OR Divider */}
        {!requiresStudio && (
          <div className="flex items-center mb-6">
            <div className="flex-grow border-t border-slate-700"></div>
            <span className="mx-4 text-slate-500 text-sm">OR</span>
            <div className="flex-grow border-t border-slate-700"></div>
          </div>
        )}
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