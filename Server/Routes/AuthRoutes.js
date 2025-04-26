import { Router } from "express";
import { getUserInfo, login, logOut, signup } from "../controllers/AuthController.js";
import { verifyToken } from "../middleware/AuthMiddleware.js";

const authRouter = Router();

const validateRequestBody = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    console.error("Request body is missing or empty");
    return res.status(400).json({ error: "Request body is missing or empty" });
  }
  next();
};

authRouter.post("/sign-up", validateRequestBody, signup);
authRouter.post("/login", validateRequestBody, login);
authRouter.get("/user-info", verifyToken, getUserInfo);
authRouter.get("/logout", verifyToken, logOut);

export default authRouter;