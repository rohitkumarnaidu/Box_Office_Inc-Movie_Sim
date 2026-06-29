import Franchise from "../models/Franchise.js";
import Studio from "../models/Studio.js";

export const getFranchises = async (req, res) => {
  try {
    const studio = await Studio.findOne({ owner: req.user._id });
    if (!studio) {
      return res.status(404).json({ success: false, message: "Studio not found" });
    }

    const franchises = await Franchise.find({ studioId: studio._id })
      .populate("movies", "title verdict worldwideGross releaseWeek sequelNumber quality")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, franchises });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFranchiseById = async (req, res) => {
  try {
    const franchise = await Franchise.findById(req.params.id)
      .populate("movies", "title verdict worldwideGross releaseWeek sequelNumber quality criticScore audienceScore budget profit")
      .lean();

    if (!franchise) {
      return res.status(404).json({ success: false, message: "Franchise not found" });
    }

    res.status(200).json({ success: true, franchise });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createFranchise = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Franchise name is required" });
    }

    const studio = await Studio.findOne({ owner: req.user._id });
    if (!studio) {
      return res.status(404).json({ success: false, message: "Studio not found" });
    }

    const franchise = await Franchise.create({
      name,
      studioId: studio._id,
      movies: [],
    });

    res.status(201).json({ success: true, franchise });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
