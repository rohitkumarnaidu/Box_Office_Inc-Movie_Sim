import Studio from "../models/Studio.js";

export const checkNegativeBalance = async (req, res, next) => {
  try {
    const studio = await Studio.findOne({ owner: req.user._id });
    if (studio && studio.money < 0) {
      return res.status(400).json({
        success: false,
        message: "Your studio is in negative balance. Clear your debt before performing this action.",
      });
    }
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
