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

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       const allowedOrigins = process.env.CLIENT_URLS
//         ? process.env.CLIENT_URLS.split(",").map((url) => url.trim())
//         : [];

//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PATCH", "DELETE"],
//   })
// );
app.use(
  cors({
    origin:'https://waste-management-client-lake.vercel.app/' ,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
  })
);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "API is running" });
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/report", reportRouter);

app.get("/api/impact-data", impactController);
app.get("/api/leaderboard-data", getLeaderBoard);

app.get("/", (req, res, next) => {
  res.send("Hello World");
  next();
});

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error("MongoDB connection error:", err);
});
