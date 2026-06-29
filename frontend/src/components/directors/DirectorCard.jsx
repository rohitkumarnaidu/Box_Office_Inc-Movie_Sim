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

const formatMoney = (amount) => Number(amount || 0).toLocaleString();

const DirectorCard = ({
  director,
  index,
  mode,
  onHire,
  onFire,
  onStartDirecting,
  hitRate = 0,
  averageRating = 0,
  contractWeeks = STANDARD_CONTRACT_WEEKS,
}) => {
  const avatar = `https://api.dicebear.com/7.x/personas/svg?seed=${director.avatarSeed}`;
  const canRelease = director.status === "AVAILABLE";
  const hiddenStats =
    director.statsRevealed === false || Number(director.discovered || 0) < 50;
  const renderDiscoveredStat = (stat) =>
    hiddenStats || stat === null || stat === undefined ? "???" : stat;

  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border border-slate-800 bg-linear-to-br from-[#0f172a] via-[#111827] to-[#0b1120] p-6 transition-all duration-300 hover:-translate-y-1 ${cardStyles[director.rarity]}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold tracking-wide ${rarityStyles[director.rarity]}`}
        >
          {director.rarity}
        </span>

        <span className="text-xs text-slate-400">
          Age {Math.floor(Number(director.age || 0))}
        </span>
      </div>

      <div className="flex flex-col items-center">
        <img
          src={avatar}
          alt={director.name}
          className="h-24 w-24 rounded-full border border-slate-700 bg-slate-800"
        />

        <Link
          to={`/directors/${director.id}`}
          className="mt-4 text-center text-xl font-bold text-white transition hover:text-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-slate-950"
        >
          {director.name}
        </Link>

        <p className="text-sm text-slate-400">{director.status}</p>
        <p className="mt-2 text-xs text-slate-500">
          Discovery {Math.min(100, Number(director.discovered || 0))}%
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Contract {director.contractYears || 1} year
          {Number(director.contractYears || 1) === 1 ? "" : "s"}
        </p>
      </div>

      <div className="mt-5 space-y-2 text-slate-300">
        <div className="flex justify-between">
          <span>Creativity</span>
          <span>{renderDiscoveredStat(director.creativity)}</span>
        </div>

        <div className="flex justify-between">
          <span>Reliability</span>
          <span>{renderDiscoveredStat(director.reliability)}</span>
        </div>

        <div className="flex justify-between">
          <span>Leadership</span>
          <span>{renderDiscoveredStat(director.leadership)}</span>
        </div>

        <div className="flex justify-between">
          <span>Reputation</span>
          <span>{director.reputation}</span>
        </div>

        <div className="flex justify-between">
          <span>Morale</span>
          <span>{director.morale}</span>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {director.genreExpertise?.map((genre, idx) => (
          <span
            key={`${genre}-${idx}`}
            className="rounded-full bg-violet-500/20 px-3 py-1 text-xs text-violet-300"
          >
            {genre}
          </span>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 rounded-2xl border border-slate-800 bg-slate-950/40 p-3 text-center">
        <div>
          <p className="text-lg font-bold text-white">
            {director.moviesDirected || 0}
          </p>
          <p className="text-xs text-slate-500">Movies</p>
        </div>

        <div>
          <p className="text-lg font-bold text-green-400">
            {director.hitMovies || 0}
          </p>
          <p className="text-xs text-slate-500">Hits</p>
        </div>

        <div>
          <p className="text-lg font-bold text-red-400">
            {director.flopMovies || 0}
          </p>
          <p className="text-xs text-slate-500">Flops</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 rounded-2xl border border-slate-800 bg-slate-950/40 p-3 text-center">
        <div>
          <p className="text-lg font-bold text-violet-300">
            {Number(hitRate || 0).toFixed(1)}%
          </p>
          <p className="text-xs text-slate-500">Hit Rate</p>
        </div>

        <div>
          <p className="text-lg font-bold text-sky-300">
            {Number(averageRating || 0).toFixed(1)}
          </p>
          <p className="text-xs text-slate-500">Avg Rating</p>
        </div>
      </div>

      <div className="mt-5 space-y-1">
        <p className="text-lg font-bold text-green-400">
          ₹{formatMoney(director.salary)}
          <span className="ml-1 text-xs text-slate-400">/week</span>
        </p>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Contract Duration</span>
          <span>{contractWeeks} weeks</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Total Salary</span>
          <span className="font-semibold text-green-400">
            ₹{formatMoney(getTotalSalary(director.salary, contractWeeks))}
          </span>
        </div>
      </div>

      <Link
        to={`/directors/${director.id}`}
        className="mt-4 block w-full rounded-xl bg-slate-700 py-3 text-center font-semibold text-white transition hover:bg-slate-600"
      >
        View Profile
      </Link>

      {mode === "market" && (
        <button
          onClick={() => onHire(index)}
          className="mt-4 w-full rounded-xl bg-violet-600 py-3 font-semibold text-white transition hover:bg-violet-700"
        >
          Hire Director
        </button>
      )}

      {mode === "owned" && (
        <div className="mt-4 space-y-2">
          {!canRelease && (
            <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
              Assigned directors must be replaced before release.
            </p>
          )}

          <button
            onClick={() => onStartDirecting(director)}
            disabled={!canRelease}
            className="w-full rounded-xl bg-violet-600 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            Start Directing
          </button>

          <button
            onClick={() => onFire(index)}
            disabled={!canRelease}
            className="w-full rounded-xl bg-red-600 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            Release Director
          </button>
        </div>
      )}
    </div>
  );
};

export default DirectorCard;
