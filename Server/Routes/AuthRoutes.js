import { Router } from "express";
import { getUserInfo, login, logOut, signup } from "../controllers/AuthController.js";
import { verifyToken } from "../middleware/AuthMiddleware.js";

const authRouter = Router();

authRouter.post("/sign-up", signup );
authRouter.post("/login", login);
authRouter.get("/user-info", verifyToken ,getUserInfo );
authRouter.get("/logout", logOut);
export default authRouter;