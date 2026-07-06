import express from "express";
import Movie from "../models/Movie.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/:movieId", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId);
    if (!movie) {
      return res.status(404).json({ success: false, message: "Movie not found" });
    }

    const { criticScore, audienceScore, verdict, title } = movie;

    // Generate quotes based on verdict
    let quotes = [];
    if (verdict === "Blockbuster" || verdict === "All-Time Blockbuster" || criticScore >= 80) {
      quotes = [
        { outlet: "CineVerse Daily", author: "Sarah Jenkins", quote: `"${title} is a triumphant achievement in modern filmmaking. Visually spectacular and emotionally resonant."`, score: 95 },
        { outlet: "The Hollywood Insider", author: "Marcus Vance", quote: `"${title} delivers exactly what fans have been waiting for. Christopher Nolan-esque scale with heart."`, score: 90 },
        { outlet: "IndieWire Review", author: "Alisha Patel", quote: `"A massive crowd-pleaser that manages to retain artistic integrity. One of the best of the year."`, score: 85 }
      ];
    } else if (verdict === "Hit" || criticScore >= 60) {
      quotes = [
        { outlet: "CineVerse Daily", author: "Sarah Jenkins", quote: `"${title} is highly entertaining and well-paced, despite a few minor script hiccups."`, score: 75 },
        { outlet: "The Hollywood Insider", author: "Marcus Vance", quote: `"Solid performances all around. It's a reliable hit that deserves your weekend attention."`, score: 70 },
        { outlet: "IndieWire Review", author: "Alisha Patel", quote: `"Though it plays it safe, the sheer execution and directing make it a very enjoyable ride."`, score: 68 }
      ];
    } else {
      quotes = [
        { outlet: "CineVerse Daily", author: "Sarah Jenkins", quote: `"${title} suffers from a disjointed narrative and flat pacing. A disappointment."`, score: 45 },
        { outlet: "The Hollywood Insider", author: "Marcus Vance", quote: `"Not even the star power can save this movie from its generic and predictable script."`, score: 35 },
        { outlet: "IndieWire Review", author: "Alisha Patel", quote: `"A chaotic mess that fails to find its footing. An unfortunate miss for the studio."`, score: 40 }
      ];
    }

    res.status(200).json({
      success: true,
      movieId: movie._id,
      title,
      criticScore,
      audienceScore,
      verdict,
      quotes
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
