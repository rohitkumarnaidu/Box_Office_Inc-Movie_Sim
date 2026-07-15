import { useState, useCallback, useRef } from "react";

export const useAsyncAction = (initialLoading = false) => {
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const mountedRef = useRef(true);

  const execute = useCallback(async (action, options = {}) => {
    const {
      onSuccess,
      onError,
      successMessage = "",
      errorMessage = "An unexpected error occurred",
    } = options;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await action();
      if (mountedRef.current) {
        if (successMessage) setSuccess(successMessage);
        if (onSuccess) onSuccess(result);
      }
      return result;
    } catch (err) {
      if (mountedRef.current) {
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          errorMessage;
        setError(msg);
        if (onError) onError(err);
      }
      throw err;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(""), []);
  const clearSuccess = useCallback(() => setSuccess(""), []);

  return {
    loading,
    error,
    success,
    execute,
    clearError,
    clearSuccess,
    setError,
  };
};

export default useAsyncAction;
