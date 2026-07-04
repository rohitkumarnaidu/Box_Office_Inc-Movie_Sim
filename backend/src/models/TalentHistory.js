import mongoose from "mongoose";

const talentHistorySchema = new mongoose.Schema({
  gameStateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GameState",
    required: true,
  },
  talentId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["CAREER", "SALARY", "AWARD", "PROGRESSION"],
    required: true,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const TalentHistory = mongoose.model("TalentHistory", talentHistorySchema);

export default TalentHistory;
