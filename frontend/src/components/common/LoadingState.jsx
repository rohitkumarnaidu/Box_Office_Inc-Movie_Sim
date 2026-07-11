export const LoadingState = ({
  message = "Loading...",
  size = "default",
  fullPage = false,
}) => {
  const sizes = {
    sm: "h-6 w-6 border-2",
    default: "h-10 w-10 border-3",
    lg: "h-16 w-16 border-4",
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div
        className={`${sizes[size] || sizes.default} animate-spin rounded-full border-slate-700 border-t-purple-500`}
        role="status"
        aria-label="Loading"
      />
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617]">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-12" role="status">
      {spinner}
    </div>
  );
};

export const TableLoadingState = ({ columns = 5, rows = 5 }) => (
  <div className="animate-pulse" aria-busy="true" aria-label="Loading table data">
    <div className="mb-4 flex gap-4">
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="h-4 flex-1 rounded bg-slate-800" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, rowIdx) => (
      <div key={rowIdx} className="mb-3 flex gap-4">
        {Array.from({ length: columns }).map((_, colIdx) => (
          <div
            key={colIdx}
            className={`h-3 flex-1 rounded bg-slate-800/60 ${colIdx === 0 ? "w-1/4" : ""}`}
          />
        ))}
      </div>
    ))}
  </div>
);

export const EmptyState = ({
  icon = "📭",
  title = "Nothing here yet",
  description = "",
  action,
}) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700/50 p-12 text-center">
    <span className="mb-4 text-4xl" role="img" aria-hidden="true">
      {icon}
    </span>
    <h3 className="mb-2 text-lg font-medium text-slate-300">{title}</h3>
    {description && (
      <p className="mb-6 max-w-md text-sm text-slate-500">{description}</p>
    )}
    {action && action}
  </div>
);
