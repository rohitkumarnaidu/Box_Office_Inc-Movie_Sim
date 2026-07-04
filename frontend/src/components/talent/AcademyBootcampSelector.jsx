import { Sparkles, DollarSign, Award, GraduationCap } from "lucide-react";

const BOOTCAMPS = [
  { id: "acting_masterclass", name: "Acting Masterclass", cost: 500000, stat: "actingSkill", boost: 5, target: "actor", description: "Deep dive into method acting and emotional delivery. Boosts Acting Skill +5." },
  { id: "media_training", name: "Media Training", cost: 200000, stat: "reputation", boost: 5, target: "any", description: "Improves public speaking and camera presence. Boosts Popularity / Reputation +5." },
  { id: "directing_workshop", name: "Directing Workshop", cost: 500000, stat: "creativity", boost: 5, target: "director", description: "Focuses on cinematic vision and shot composition. Boosts Creativity +5." },
  { id: "leadership_bootcamp", name: "Leadership Bootcamp", cost: 300000, stat: "leadership", boost: 5, target: "director", description: "Builds team management and set command. Boosts Leadership +5." }
];

const AcademyBootcampSelector = ({ selectedTalentType, studioMoney, onEnroll }) => {
  const filteredBootcamps = BOOTCAMPS.filter(
    (b) => b.target === "any" || b.target === selectedTalentType
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
      <h3 className="text-white font-bold text-base flex items-center gap-2">
        <GraduationCap className="text-violet-400" size={20} /> Select Bootcamp Program
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredBootcamps.map((bootcamp) => {
          const canAfford = studioMoney >= bootcamp.cost;

          return (
            <div
              key={bootcamp.id}
              className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col justify-between space-y-3"
            >
              <div>
                <h4 className="text-white font-bold text-sm flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-400" /> {bootcamp.name}
                </h4>
                <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">{bootcamp.description}</p>
              </div>

              <div className="flex justify-between items-center border-t border-slate-850 pt-2 text-xs">
                <span className="text-slate-500">Cost:</span>
                <span className="font-bold text-green-400 flex items-center"><DollarSign size={12} /> {bootcamp.cost.toLocaleString()}</span>
              </div>

              <button
                onClick={() => onEnroll(bootcamp.id)}
                disabled={!canAfford}
                className="w-full bg-violet-600 hover:bg-violet-750 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition cursor-pointer"
              >
                {canAfford ? "Enroll Talent" : "Cannot Afford"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AcademyBootcampSelector;
