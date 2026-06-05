import app from "../src/app.js";
import connectDB from "../src/config/db.js";
import "../src/models/index.js";

const handler = async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error("Vercel Handler Error:", error);
    res.status(500).send("Internal Server Error");
  }
};

export default handler;
