import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { getDBConnection } from "../db/dbConfig.js";
dotenv.config();

export const verifyToken = async (req, res, next) => {
    await getDBConnection();
    const token = req.cookies.wmsjwt;
    
    if(!token) return res.status(401).send("You are not Authenticated.");
    jwt.verify(token, process.env.JWT_KEY, async (err, user) => {
        if(err) return res.status(403).send("token not valid!");
        req.userId = user.userId;
        next();
    });
}