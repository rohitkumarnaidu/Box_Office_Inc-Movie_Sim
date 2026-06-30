import axios from "axios";

const DEFAULT_TIMEOUT = 10000;
const MAX_RETRIES = 2;
const RETRY_DELAY_BASE = 1000;

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5000",
  timeout: DEFAULT_TIMEOUT,
  headers: { "Content-Type": "application/json" },
});

httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    if (!config || config._retryCount >= MAX_RETRIES) {
      return Promise.reject(normalizeError(error));
    }

    const status = error.response?.status;
    const isRetryable = !status || status >= 500;

    if (!isRetryable) {
      return Promise.reject(normalizeError(error));
    }

    config._retryCount = (config._retryCount || 0) + 1;
    const delay = RETRY_DELAY_BASE * Math.pow(2, config._retryCount - 1);

    await new Promise((resolve) => setTimeout(resolve, delay));
    return httpClient(config);
  }
);

function normalizeError(error) {
  if (error.code === "ECONNABORTED") {
    return {
      message: "Request timed out. Please check your connection and try again.",
      code: "TIMEOUT",
      status: 0,
    };
  }
  if (!error.response) {
    return {
      message: "Network error. The server may be unreachable.",
      code: "NETWORK",
      status: 0,
    };
  }
  return {
    message: error.response.data?.message || error.response.data?.error || "Something went wrong.",
    code: "API_ERROR",
    status: error.response.status,
  };
}

export default httpClient;
