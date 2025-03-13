import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './db/dbConfig.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRouter from './Routes/AuthRoutes.js';
import userRouter from './Routes/UserRoutes.js';
import { getLeaderBoard, impactController } from './controllers/ImpactController.js';
import reportRouter from './Routes/ReportRoutes.js';

dotenv.config();

connectDB();
const app = express();
app.use(express.json());
app.use(cookieParser());

// Cors for cross connection between frontend and backend.
app.use(cors({
    origin: process.env.CLIENT_URL || "https://waste-management-client-lake.vercel.app/",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH','DELETE'],
}));

// middlewares
app.use((req, res, next) => {
    console.log(`Request_Endpoint: ${req.method} ${req.url}`);
    next();
});
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/report", reportRouter);

app.get("/api/impact-data", impactController);
app.get("/api/leaderboard-data", getLeaderBoard);


app.get("/",(req, res, next) => {
    res.send('Hello World');
    next();
});

app.listen(() => {
    console.log(`Server is running`);
});