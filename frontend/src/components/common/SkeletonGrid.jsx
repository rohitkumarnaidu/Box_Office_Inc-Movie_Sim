const variantConfig = {
  default: {
    minHeight: "min-h-[360px]",
    showAvatar: false,
    showTags: true,
    rows: 4,
  },
  talent: {
    minHeight: "min-h-[520px]",
    showAvatar: true,
    showTags: true,
    rows: 5,
  },
  compact: {
    minHeight: "min-h-[260px]",
    showAvatar: false,
    showTags: false,
    rows: 4,
  },
};

const SkeletonLine = ({ className = "" }) => (
  <div className={`rounded bg-slate-700/80 ${className}`} />
);

const SkeletonCard = ({ variant = "default" }) => {
  const config = variantConfig[variant] || variantConfig.default;

  return (
    <div
      className={`flex h-full ${config.minHeight} animate-pulse flex-col rounded-3xl border border-slate-800 bg-linear-to-br from-[#0f172a] via-[#111827] to-[#0b1120] p-6`}
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <SkeletonLine className="h-6 w-28 rounded-full" />
        <SkeletonLine className="h-5 w-16 rounded-full" />
      </div>

      {config.showAvatar && (
        <div className="mb-6 flex flex-col items-center">
          <div className="h-24 w-24 rounded-full border border-slate-700 bg-slate-800" />
          <SkeletonLine className="mt-4 h-6 w-40 rounded-lg" />
          <SkeletonLine className="mt-3 h-4 w-24 rounded-lg" />
        </div>
      )}

      <div className="flex-grow space-y-4">
        {!config.showAvatar && <SkeletonLine className="h-7 w-3/4 rounded-lg" />}

        {Array.from({ length: config.rows }).map((_, index) => (
          <div key={index} className="flex items-center justify-between gap-6">
            <SkeletonLine className="h-4 w-1/3" />
            <SkeletonLine className="h-4 w-1/4" />
          </div>
        ))}
      </div>

      {config.showTags && (
        <div className="mt-6 flex gap-2">
          <SkeletonLine className="h-6 w-16 rounded-full" />
          <SkeletonLine className="h-6 w-20 rounded-full" />
        </div>
      )}

      <div className="mt-6 flex items-center justify-between gap-4">
        <SkeletonLine className="h-7 w-24 rounded-lg" />
        <SkeletonLine className="h-11 w-28 rounded-xl" />
      </div>
    </div>
  );
};

export const SkeletonGrid = ({ count = 6, variant = "default" }) => {
  return (
    <div
      className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
      aria-busy="true"
      aria-label="Loading marketplace items"
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} variant={variant} />
      ))}
    </div>
  );
};

export default SkeletonGrid;
