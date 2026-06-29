import { Link } from "react-router-dom";
import { STANDARD_CONTRACT_WEEKS, getTotalSalary } from "../../config/contract";

const rarityStyles = {
  Common: "bg-slate-500/20 text-slate-300 border border-slate-500/30",

  Uncommon: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",

  Rare: "bg-sky-500/20 text-sky-300 border border-sky-500/30",

  Epic: "bg-violet-500/20 text-violet-300 border border-violet-500/30",

  Legendary: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
};

const cardStyles = {
  Common: "hover:border-slate-500",

  Uncommon: "hover:border-emerald-500",

  Rare: "hover:border-sky-500",

  Epic: "hover:border-violet-500",

  Legendary: "hover:border-amber-500",
};

const WriterCard = ({
  writer,
  index,
  mode,
  onHire,
  onFire,
  onStartWriting,
  contractWeeks = STANDARD_CONTRACT_WEEKS,
}) => {
  const avatar = `https://api.dicebear.com/7.x/personas/svg?seed=${writer.avatarSeed}`;

  const hiddenStats =
    writer.statsRevealed === false || Number(writer.discovered || 0) < 50;

  const renderDiscoveredStat = (stat) =>
    hiddenStats || stat === null || stat === undefined ? "???" : stat;

  return (
    <div
      className={`group relative overflow-hidden
      bg-linear-to-br
      from-[#0f172a]
      via-[#111827]
      to-[#0b1120]
      border border-slate-800
      rounded-3xl
      p-6
      transition-all
      duration-300
      hover:-translate-y-1
      ${cardStyles[writer.rarity]}`}
    >
      <div className="flex justify-between items-center mb-4">
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${rarityStyles[writer.rarity]}`}
        >
          {writer.rarity}
        </span>

        <span className="text-slate-400 text-xs">
          Age {Math.floor(writer.age)}
        </span>
      </div>

      <div className="flex flex-col items-center">
        <img
          src={avatar}
          alt={writer.name}
          className="w-24 h-24 rounded-full bg-slate-800 border border-slate-700"
        />

        <Link
          to={`/writers/${writer.id}/profile`}
          className="mt-4 text-xl font-bold text-white text-center transition hover:text-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-slate-950"
        >
          {writer.name}
        </Link>

        <p className="text-sm text-slate-400">{writer.status}</p>

        <p className="mt-2 text-xs text-slate-500">
          Discovery {Math.min(100, Number(writer.discovered || 0))}%
        </p>
      </div>

      <div className="mt-5 space-y-2 text-slate-300">
        <div className="flex justify-between">
          <span>Originality</span>

          <span>{renderDiscoveredStat(writer.originality)}</span>
        </div>

        <div className="flex justify-between">
          <span>Consistency</span>

          <span>{renderDiscoveredStat(writer.consistency)}</span>
        </div>

        <div className="flex justify-between">
          <span>Reliability</span>

          <span>{renderDiscoveredStat(writer.reliability)}</span>
        </div>

        <div className="flex justify-between">
          <span>Reputation</span>

          <span>{writer.reputation}</span>
        </div>

        <div className="flex justify-between">
          <span>Morale</span>

          <span>{writer.morale}</span>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {writer.genreExpertise?.map((genre, idx) => (
          <span
            key={`${genre}-${idx}`}
            className="bg-violet-500/20 text-violet-300 px-3 py-1 rounded-full text-xs"
          >
            {genre}
          </span>
        ))}
      </div>

      <div className="mt-5 space-y-1">
        <p className="text-green-400 text-lg font-bold">
          ₹{writer.salary?.toLocaleString()}
          <span className="text-xs text-slate-400 ml-1">/week</span>
        </p>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Contract Duration</span>
          <span>{contractWeeks} weeks</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Total Salary</span>
          <span className="text-green-400 font-semibold">
            ₹{getTotalSalary(writer.salary, contractWeeks).toLocaleString()}
          </span>
        </div>
      </div>

      <Link
        to={`/writers/${writer.id}/profile`}
        className="mt-4 block w-full rounded-xl bg-slate-700 py-3 text-center font-semibold text-white transition hover:bg-slate-600"
      >
        View Profile
      </Link>

      {mode === "market" && (
        <button
          onClick={() => onHire(index)}
          className="mt-4 w-full bg-violet-600 hover:bg-violet-700 py-3 rounded-xl text-white font-semibold transition"
        >
          Hire Writer
        </button>
      )}

      {mode === "owned" && (
        <div className="mt-4 space-y-2">
          <button
            onClick={() => onStartWriting(writer)}
            disabled={writer.status !== "AVAILABLE"}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-700 py-3 rounded-xl text-white font-semibold transition"
          >
            Start Writing
          </button>

          <button
            onClick={() => onFire(index)}
            className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-xl text-white font-semibold transition"
          >
            Fire Writer
          </button>
        </div>
      )}
    </div>
  );
};

export default WriterCard;
