import app from "./src/app.js";
import env from "./src/config/envConfig.js";
import connectDB from "./src/config/db.js";

import "./src/models/index.js";

const startServer = async () => {
  try {
    await connectDB();

    app.listen(env.PORT, () => {
      console.log(`Server Running On Port ${env.PORT}`);
    });
  } catch (error) {
    console.error(error);

    process.exit(1);
  }
};

startServer();
