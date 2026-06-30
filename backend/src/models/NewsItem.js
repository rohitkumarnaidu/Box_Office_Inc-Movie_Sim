import mongoose from "mongoose";

const newsItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["box_office", "award", "event", "rivalry", "trend"],
      required: true,
    },
    headline: { type: String, required: true },
    body: { type: String, required: true },
    week: { type: Number, required: true },
    studioId: { type: mongoose.Schema.Types.ObjectId, ref: "Studio", default: null },
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", default: null },
  },
  { timestamps: true }
);

const NewsItem = mongoose.model("NewsItem", newsItemSchema);
export default NewsItem;
