import mongoose from "mongoose";

const franchiseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    studioId: { type: mongoose.Schema.Types.ObjectId, ref: "Studio", required: true },
    movies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }],
    totalRevenue: { type: Number, default: 0 },
    fanbaseMultiplier: { type: Number, default: 1.0 },
    prestigeBonus: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Franchise = mongoose.model("Franchise", franchiseSchema);
export default Franchise;
