import mongoose from "mongoose";

const historicRecordSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    studioId: { type: String, required: true },
    studioName: { type: String, required: true },
    worldwideGross: { type: Number, default: 0 },
    openingWeekend: { type: Number, default: 0 },
    roi: { type: Number, default: 0 },
    releaseWeek: { type: Number, required: true },
    year: { type: Number, required: true },
    isRival: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Add indexes for efficient sorting of Top 50 leaderboards
historicRecordSchema.index({ worldwideGross: -1 });
historicRecordSchema.index({ openingWeekend: -1 });
historicRecordSchema.index({ roi: -1 });

const HistoricRecord = mongoose.model("HistoricRecord", historicRecordSchema);

export default HistoricRecord;
