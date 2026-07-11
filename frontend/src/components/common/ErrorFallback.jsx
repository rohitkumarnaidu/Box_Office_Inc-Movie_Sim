import { Component } from "react";

const ErrorFallback = ({ error, errorInfo, onRetry, title }) => {
  const isDev = import.meta.env.DEV;

  return (
    <div
      role="alert"
      className="flex min-h-[400px] items-center justify-center p-6"
    >
      <div className="max-w-lg rounded-2xl border border-red-800/40 bg-red-900/10 p-8 text-center backdrop-blur-sm">
        <div className="mb-4 flex justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-red-900/30 text-3xl">
            ⚠
          </span>
        </div>

        <h2 className="mb-2 text-xl font-semibold text-red-400">
          {title || "Something went wrong"}
        </h2>

        <p className="mb-6 text-sm text-slate-400">
          An unexpected error occurred. Please try again or contact support if
          the problem persists.
        </p>

        {isDev && error && (
          <div className="mb-6 overflow-auto rounded-lg bg-slate-900 p-4 text-left">
            <p className="mb-2 font-mono text-xs text-red-400">
              {error.name}: {error.message}
            </p>
            {errorInfo && (
              <details className="mt-2">
                <summary className="cursor-pointer text-xs text-slate-500 hover:text-slate-300">
                  Stack trace
                </summary>
                <pre className="mt-2 max-h-40 overflow-auto font-mono text-xs text-slate-500">
                  {errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        )}

        <div className="flex justify-center gap-4">
          {onRetry && (
            <button
              onClick={onRetry}
              className="rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              Try again
            </button>
          )}
          <a
            href="/"
            className="rounded-xl border border-slate-700 px-6 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;
