import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api, { persistAuthSession } from "../../api/axios";

import AuthLayout from "../../layouts/AuthLayout";
import AuthCard from "../../components/common/AuthCard";
import AuthInput from "../../components/common/AuthInput";
import { useGoogleLoginMutation } from '../../features/auth/authApi';
import { GoogleLogin } from '@react-oauth/google';

const Register = () => {
  const navigate = useNavigate();


  const [googleLoginMutation, { isLoading }] = useGoogleLoginMutation();
  const [requiresStudio, setRequiresStudio] = useState(false);
  const [pendingToken, setPendingToken] = useState(null);
  const [googleStudioName, setGoogleStudioName] = useState("");


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
      setError("Google Registration Failed.");
    }
  };

  const handleGoogleStudioSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await googleLoginMutation({ token: pendingToken, studioName: googleStudioName }).unwrap();
      persistAuthSession({
        user: res.user,
        token: res.token,
        accessTokenExpiresAt: res.accessTokenExpiresAt,
      });
      navigate('/'); 
    } catch (error) {
      console.error("Failed to create studio:", error);
      setError("Failed to finish Google account creation.");
    }
  };
  return (
    <AuthLayout>
      <AuthCard title="Create Studio">
        {/* --- GOOGLE AUTH SECTION --- */}
        <div className="mb-6 flex flex-col items-center">
          {!requiresStudio ? (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Registration Failed')}
              theme="outline"
            />
          ) : (
            <form onSubmit={handleGoogleStudioSubmit} className="w-full flex flex-col gap-3 p-4 bg-slate-800 rounded-lg border border-violet-500">
              <h3 className="text-white text-sm text-center">Almost there! What should we call your studio?</h3>
              <input 
                type="text" 
                placeholder="e.g. DreamWorks"
                value={googleStudioName}
                onChange={(e) => setGoogleStudioName(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg border border-slate-700 focus:border-violet-500"
              />
              <button 
                type="submit" 
                disabled={isLoading || !googleStudioName}
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