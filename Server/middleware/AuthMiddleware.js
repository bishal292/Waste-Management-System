import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const verifyToken = (req, res, next) => {
    const token = req.cookies.jwt;
    if(!token) return res.status(401).send("You are not Authenticated.");
    jwt.verify(token, process.env.JWT_KEY, async (err, user) => {
        if(err) return res.status(403).send("token not valid!");
        req.userId = user.userId;
        console.log(user.userId)
        next();
    });
}