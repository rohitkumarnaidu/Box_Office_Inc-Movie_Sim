import mongoose from "mongoose";

const studioSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    money: {
      type: Number,
      default: 1000000,
      min: 0,
    },

    prestige: {
      type: Number,
      default: 0,
      min: 0,
    },

    fans: {
      type: Number,
      default: 0,
      min: 0,
    },

    studioLevel: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

const Studio = mongoose.model("Studio", studioSchema);

export default Studio;
