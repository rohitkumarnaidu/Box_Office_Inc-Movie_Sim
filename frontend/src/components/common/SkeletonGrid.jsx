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
  detail: {
    minHeight: "min-h-[480px]",
    showAvatar: false,
    showTags: false,
    rows: 6,
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

export const PageSkeleton = ({ title = "Loading..." }) => (
  <div className="animate-pulse space-y-6 p-6" role="status" aria-label={title}>
    <div className="flex items-center gap-4">
      <SkeletonLine className="h-10 w-10 rounded-xl" />
      <div className="space-y-2">
        <SkeletonLine className="h-6 w-48 rounded-lg" />
        <SkeletonLine className="h-4 w-32 rounded-lg" />
      </div>
    </div>
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex h-40 animate-pulse flex-col rounded-2xl border border-slate-800 bg-[#111827] p-5"
        >
          <SkeletonLine className="h-4 w-24 rounded-lg" />
          <SkeletonLine className="mt-3 h-8 w-20 rounded-lg" />
          <SkeletonLine className="mt-auto h-4 w-32 rounded-lg" />
        </div>
      ))}
    </div>
    <SkeletonLine className="h-64 w-full rounded-2xl" />
  </div>
);

export const DetailSkeleton = ({ title = "Loading details..." }) => (
  <div className="animate-pulse space-y-6" role="status" aria-label={title}>
    <div className="flex flex-col items-center space-y-4 py-8">
      <SkeletonLine className="h-28 w-28 rounded-full" />
      <SkeletonLine className="h-8 w-56 rounded-lg" />
      <SkeletonLine className="h-4 w-32 rounded-lg" />
    </div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-[#111827] p-4"
        >
          <SkeletonLine className="h-3 w-20 rounded-lg" />
          <SkeletonLine className="h-6 w-16 rounded-lg" />
        </div>
      ))}
    </div>
    <SkeletonLine className="h-48 w-full rounded-2xl" />
    <SkeletonLine className="h-48 w-full rounded-2xl" />
  </div>
);

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
