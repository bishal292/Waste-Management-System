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

connectDB();
const app = express();
app.use(express.json());
app.use(cookieParser());

console.log(process.env.CLIENT_URL);
// const corsOptions = {
//   origin:
//     process.env.CLIENT_URL || "https://waste-management-client-lake.vercel.app",
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
// };

// app.use(cors(corsOptions));

// // Manually set CORS headers in responses
// app.use((req, res, next) => {
//   res.header(
//     "Access-Control-Allow-Origin",
//     process.env.CLIENT_URL || "https://waste-management-client-lake.vercel.app"
//   );
//   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
//   res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   res.header("Access-Control-Allow-Credentials", "true");
//   next();
// });

app.use(cors({
    origin: '*', // Allow requests from all origins
    credentials: true, // If you need to send cookies or authentication headers
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/report", reportRouter);

app.get("/api/impact-data", impactController);
app.get("/api/leaderboard-data", getLeaderBoard);

app.get("/", (req, res, next) => {
  res.send("Hello World");
  next();
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
