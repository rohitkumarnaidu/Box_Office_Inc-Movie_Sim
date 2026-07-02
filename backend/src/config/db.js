import mongoose from "mongoose";
import env from "./envConfig.js";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

const connectDB = async () => {
  try {
    let mongoUri = env.MONGO_URI;
    
    // Use in-memory MongoDB if MONGO_URI is placeholder or not provided
    if (mongoUri.includes("mongodb+srv://user:pass@cluster.mongodb.net/dbname") || !mongoUri) {
      console.log("Starting in-memory MongoDB server...");
      mongoServer = await MongoMemoryServer.create({
        instance: {
          port: 27017,
        },
        binary: {
          version: "6.0.5",
          skipMD5: true,
        },
        debug: true,
        startTimeout: 300000, // 5 minutes timeout
      });
      mongoUri = mongoServer.getUri();
      console.log(`In-memory MongoDB URI: ${mongoUri}`);
    }

    const conn = await mongoose.connect(mongoUri);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);

    process.exit(1);
  }
};

// Cleanup function for in-memory server
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (error) {
    console.error(`Error disconnecting from MongoDB: ${error.message}`);
  }
};

export { connectDB, disconnectDB };
export default connectDB;
