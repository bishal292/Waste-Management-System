import mongoose from "mongoose";

let cachedConnection = null;

export async function connectDB() {
  // Ensure DB_URL is defined
  if (!process.env.DB_URL) {
    throw new Error("DB_URL is not defined in environment variables.");
  }

  // If we already have a connection, use it
  if (cachedConnection) {
    return cachedConnection;
  }

  // If no connection, create a new one
  try {
    const conn = await mongoose.connect(process.env.DB_URL, {
      // MongoDB connection options
      useUnifiedTopology: true,
    });

    cachedConnection = conn;
    console.log("MongoDB connected");
    return conn;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

// For serverless environments, connect to DB on each request
export async function getDBConnection() {
  if (mongoose.connection.readyState !== 1) {
    return connectDB();
  }
  return mongoose.connection;
}