import axios from "axios";

import { store } from "../app/store";
import { logout, setCredentials } from "../features/auth/authSlice";

const baseURL = "http://localhost:5000/api";

const refreshClient = axios.create({
  baseURL,
  withCredentials: true,
});

const api = axios.create({
  baseURL,
  withCredentials: true,
});

let refreshRequest = null;

const isAuthEndpoint = (url = "") =>
  url.includes("/auth/login") ||
  url.includes("/auth/register") ||
  url.includes("/auth/refresh") ||
  url.includes("/auth/logout");

export const refreshAuthSession = async () => {
  if (!refreshRequest) {
    refreshRequest = refreshClient
      .post("/auth/refresh")
      .then((res) => {
        store.dispatch(
          setCredentials({
            user: res.data.user,
            token: res.data.token,
          }),
        );

        return res;
      })
      .finally(() => {
        refreshRequest = null;
      });
  }

  return refreshRequest;
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint(originalRequest.url)
    ) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await refreshAuthSession();
        const token = refreshResponse.data.token;

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${token}`;

        return api(originalRequest);
      } catch (refreshError) {
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
