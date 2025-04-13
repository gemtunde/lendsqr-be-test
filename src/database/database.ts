import mongoose from "mongoose";
import { config } from "@/config/app.config";

const connectDatabase = async () => {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log("connected MongoDb success");
  } catch (error) {
    console.log("Error in connected MongoDb ", error);
    process.exit(1);
  }
};

export default connectDatabase;
