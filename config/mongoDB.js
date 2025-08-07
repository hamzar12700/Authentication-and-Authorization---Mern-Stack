import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

const connectDb = async () => {
  try {
    const conn = await mongoose.connect(`${process.env.MONGO}/mernAuth`);
    console.log("✅ MongoDB connected to:", conn.connection.name);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
  }
};

export default connectDb;
