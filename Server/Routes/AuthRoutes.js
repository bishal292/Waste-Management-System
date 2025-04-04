import { Router } from "express";
import { getUserInfo, login, logOut, signup } from "../controllers/AuthController.js";
import { verifyToken } from "../middleware/AuthMiddleware.js";

const authRouter = Router();

// Middleware to validate request body for POST routes
const validateRequestBody = (req, res, next) => {
  console.log("Request Body:", req.body); // Debug log
  if (!req.body || Object.keys(req.body).length === 0) {
    console.error("Request body is missing or empty"); // Log error
    return res.status(400).json({ error: "Request body is missing or empty" });
  }
  next();
};

authRouter.post("/sign-up", validateRequestBody, signup);
authRouter.post("/login", validateRequestBody, login);
authRouter.get("/user-info", verifyToken, getUserInfo);
authRouter.get("/logout", verifyToken, logOut);

export default authRouter;