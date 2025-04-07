import { Notifications, Rewards, Transaction, User } from "../db/Schemas.js";
import jwt from "jsonwebtoken";
import { compare } from "bcrypt";
import { getDBConnection } from "../db/dbConfig.js";

const maxAge = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds.

const createToken = (email, id) => {
  return jwt.sign({ userId: id, email }, process.env.JWT_KEY, {
    expiresIn: maxAge,
  });
};

export const signup = async (req, res) => {
  try {
    await getDBConnection();
    const { email, password, name } = req.body;
    if (!email || !password || !name)
      return res.status(400).send("All fields are required");

    const checkUser = await User.findOne({ email });
    if (checkUser) {
      console.log(`Email already exists`);
      return res.status(409).send("User with email Already exists");
    }
    if (password.length < 4) {
      return res.status(400).send("Password must be atleast 4 characters long");
    }

    const user = new User({ email, password, name });
    await user.save();
    res.cookie("wmsjwt", createToken(user.email, user._id), {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge,
    });

    res.status(201).json({
      notification: [],
      totalBalance: 0,
      user: {
        email: user.email,
        id: user._id,
        name: user.name,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};

export const login = async (req, res) => {
  try {
    await getDBConnection();
    console.log("Login request received:", req.body); // Debug log
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).send("Email and password are required");

    const user = await User.findOne({ email });

    if (!user) {
      console.log(`User Not found`);
      return res.status(404).send("User not found");
    }
    const auth = await compare(password, user.password);

    if (!auth) {
      console.log(`Invalid credentials`);
      return res.status(401).send("Invalid credentials");
    }

    res.cookie("wmsjwt", createToken(email, user._id), {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge,
    });

    const notification = await Notifications.find({
      userId: req.userId,
      ifRead: false,
    });
    const transaction = await Transaction.find({ userId: req.userId });
    const totalBalance = transaction.reduce(
      (acc, transaction) => acc + transaction.amount,
      0
    );

    res.status(200).json({
      user: { id: user._id, email: user.email, name: user.name },
      notification: Array.from(notification),
      totalBalance,
    });
  } catch (error) {
    console.error("Error in login:", error); // Log the error
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getUserInfo = async (req, res) => {
  try {
    await getDBConnection();
    const userId = req.userId;
    if (!userId) return res.status(401).send("You are not Authenticated");

    const userData = await User.findById(userId);
    if (!userData) return res.status(404).send("User Not Found");

    const unreadNotification = await Notifications.find({
      userId,
      isRead: false,
    });

    const rewards = await Rewards.find({ userId, isAvailable: true });
    const totalPoints = rewards.reduce((sum, reward) => sum + reward.points, 0);
    res.status(200).json({
      user: { id: userData._id, email: userData.email, name: userData.name },
      // notification: Array.from(notification),
      notification: unreadNotification,
      totalBalance: totalPoints,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};

export const logOut = async (req, res) => {
  try {
    await getDBConnection();
    res.cookie("wmsjwt", "", {
      maxAge: 1,
      httpOnly: true,
      secure: true,
      SameSite: "None",
    });
    res.status(200).send("Logged Out Successfully");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};
