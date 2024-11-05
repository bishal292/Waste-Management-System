import { Router } from "express";
import { verifyToken } from "../middleware/AuthMiddleware.js";
import { getTransactionAndRewards, redeemReward, setReward , markNotificationRead, redeemAllRewards } from "../controllers/UserController.js";

const userRouter = Router();

userRouter.post("/set-reward",verifyToken,setReward);
userRouter.patch("/redeem-reward",verifyToken,redeemReward);
userRouter.patch("/redeem-all-rewards",verifyToken,redeemAllRewards);
userRouter.get("/get-transactions-reward",verifyToken,getTransactionAndRewards);
userRouter.patch("/mark-notification-read",verifyToken,markNotificationRead);
export default userRouter;