const WritingProjectCard = ({ project }) => {
  const remainingWeeks = Math.max(
    0,
    project.completionWeek -
      project.startWeek -
      Math.floor(
        (project.progress / 100) * (project.completionWeek - project.startWeek),
      ),
  );

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold text-white">
          {project.genre} Project
        </h2>

        <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs">
          {project.status}
        </span>
      </div>

      <div className="space-y-2 text-slate-300">
        <div className="flex justify-between">
          <span>Writer</span>
          <span>{project.writerName}</span>
        </div>

        <div className="flex justify-between">
          <span>Audience</span>
          <span>{project.targetAudience}</span>
        </div>

        <div className="flex justify-between">
          <span>Progress</span>
          <span>{project.progress}%</span>
        </div>

        <div className="flex justify-between">
          <span>Remaining</span>
          <span>{remainingWeeks} Weeks</span>
        </div>
      </div>

      <div className="mt-4">
        <div className="h-3 rounded-full bg-slate-700 overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-500"
            style={{
              width: `${project.progress}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default WritingProjectCard;
