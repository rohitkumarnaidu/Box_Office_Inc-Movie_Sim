import mongoose from "mongoose";

const studioUpgradeSchema = new mongoose.Schema(
  {
    studioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Studio",
      required: true,
    },
    upgradeId: {
      type: String,
      required: true,
    },
    purchasedWeek: {
      type: Number,
      required: true,
    }
  },
  { timestamps: true }
);

const StudioUpgrade = mongoose.model("StudioUpgrade", studioUpgradeSchema);

export default StudioUpgrade;
