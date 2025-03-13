import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export const connectDB = async () => {
    const connection_String = process.env.DB_URL;
    try {
        await mongoose.connect(connection_String);
        console.log("MongoDB Connected Successfully");
    } catch (error) {
        console.error("Error Connecting with MongoDB:", error);
    }
};

export const disconnectDB = async () => {
    try {
        await mongoose.disconnect();
        console.log("MongoDB Disconnected Successfully");
    } catch (error) {
        console.error("Error Disconnecting with MongoDB:", error);
    }
};