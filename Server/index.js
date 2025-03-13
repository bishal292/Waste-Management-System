import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./db/dbConfig.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./Routes/AuthRoutes.js";
import userRouter from "./Routes/UserRoutes.js";
import {
  getLeaderBoard,
  impactController,
} from "./controllers/ImpactController.js";
import reportRouter from "./Routes/ReportRoutes.js";

dotenv.config();

const app = express();
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define allowed origins
const allowedOrigins = [
  "https://waste-management-client-lake.vercel.app",
  "https://your-other-domain.com",
  // Add any other domains that need access
];

// If CLIENT_URL is defined in environment variables, add it to allowed origins
if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

// Add localhost for development
if (process.env.NODE_ENV !== "production") {
  allowedOrigins.push("http://localhost:3000");
  allowedOrigins.push("http://localhost:5173");
}

// CORS middleware with dynamic origin validation
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "API is running" })
})

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/report", reportRouter);

app.get("/api/impact-data", impactController);
app.get("/api/leaderboard-data", getLeaderBoard);

app.get("/", (req, res, next) => {
  res.send("Hello World");
  next();
});

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000
  mongoose
    .connect(process.env.DB_URL)
    .then(() => {
      console.log("Connected to MongoDB")
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`)
      })
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err)
    })
}

export default app;
