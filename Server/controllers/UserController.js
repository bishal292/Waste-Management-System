import { createRewardPoints } from "../Utils/Util-function.js";
import { Notifications, Report, Rewards, Transaction } from "../db/Schemas.js";
import { getDBConnection } from "../db/dbConfig.js";

// post request controller to set rewards for a user.
export const setReward = async (req, res) => {
  try {
    await getDBConnection();
    const userId = req.userId;
    if (!userId) {
      return res.status(401).send("You are not Authenticated.");
    }
    let { points, name } = req.body;
    if (!points || !name) {
      return res.status(400).send("Please provide all the details.");
    }
    if (points < 0) {
      return res.status(400).send("Points can't be negative.");
    }
    name = name.toLowerCase();
    if (name !== "collect" && name !== "report") {
      return res.status(400).send("Invalid Name");
    }
    const reward = new Rewards({
      userId,
      points,
      desc: `points earned for ${name}ing waste`,
      name,
    });
    await Transaction.create({
      userId,
      type: `earned_${name}`,
      amount: reward.points,
      description:
        name === "collect"
          ? "Points earned for collecting waste"
          : "Points earned for reporting waste",
    });
    const notification = new Notifications({
      userId,
      message: `You have received ${points} points for waste ${
        name === "collect" ? "collection" : "reporting"
      }`,
    });
    // creating notifications for the same.
    await notification.save();
    await reward.save();
    res.status(201).send("Reward Set Successfully");
  } catch (error) {
    console.error("Some Error Occured", error);
    res.status(500).send("Internal Server Error");
  }
};

// get request controller to get all the transactions and rewards of a user.
export const getTransactionAndRewards = async (req, res) => {
  try {
    await getDBConnection();
    const userId = req.userId;
    if (!userId) {
      return res.status(401).send("You are not Authenticated.");
    }
    const transactions = await Transaction.find({ userId }).sort({ date: -1 });
    const rewards = await Rewards.find({ userId, isAvailable: true }).sort({
      createdAt: -1,
    });

    res.status(200).json({ transactions, rewards });
  } catch (error) {
    console.error("Some Error Occured", error);
    res.status(500).send("Internal Server Error");
  }
};

// post request controller to redeem rewards or mark a reward as read for a user.
export const redeemReward = async (req, res) => {
  try {
    await getDBConnection();
    const userId = req.userId;
    if (!userId) {
      return res.status(401).send("You are not Authenticated.");
    }
    const { rewardId } = req.body;
    if (!rewardId) {
      return res.status(400).send("Please provide all the details.");
    }
    const reward = await Rewards.findById(rewardId);
    if (!reward) {
      return res.status(404).send("Reward Not Found");
    }
    if (reward.isAvailable === false) {
      return res.status(400).send("Reward Already Redeemed");
    }
    if (reward.userId.toString() !== userId) {
      return res.status(401).send("You are not Authorized to redeem this reward.");
    }
    await Rewards.findByIdAndUpdate(rewardId, { isAvailable: false });
    await Transaction.create({
      userId,
      type: "redeemed_reward",
      amount: -reward.points,
      description: `Redeemed Points.`,
    });
    const notification = new Notifications({
      userId,
      message: `You have redeemed ${reward.points} points.`,
    });
    await notification.save();
    res.status(200).send("Reward Redeemed Successfully");
  } catch (error) {
    console.error("Some Error Occured", error);
    res.status(500).send("Internal Server Error");
  }
};

export const redeemAllRewards = async (req, res) => {
  try {
    await getDBConnection();
    const userId = req.userId;
    if (!userId) {
      return res.status(401).send("You are not Authenticated.");
    }
    const rewards = await Rewards.find({ userId, isAvailable: true });
    if (rewards.length === 0) {
      return res.status(400).send("No Rewards Available to Redeem.");
    }
    const points = rewards.reduce((acc, reward) => acc + reward.points, 0);

    console.log("Total Points to Redeem:", points);
    
    await Rewards.updateMany(
      { userId, isAvailable: true },
      { $set: { isAvailable: false } }
    ).then(async () => {
      const notification = new Notifications({
        userId,
        message: `You have redeemed all your points.`,
      })
      await notification.save();

      await Transaction.create({
        userId,
        type: "redeemed_reward",
        amount: -points,
        description: `Redeemed all Points.`,
      })
      res.status(200).send("All Rewards Redeemed Successfully");
    });
  } catch (error) {
    console.error("Some Error Occured", error);
    res.status(500).send("Internal Server Error");
  }
};
// to respond all the reports reported by the user.
export const getReports = async (req, res) => {
  try {
    await getDBConnection();
    const userId = req.userId;
    if (!userId) {
      return res.status(401).send("You are not Authenticated.");
    }
    const { skip, limit } = req.query;
    if (skip && limit) {
      const reports = await Report.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("amount createdAt _id location wasteType");
      res.status(200).json(reports);
    } else {
      const reports = await Report.find({ userId })
        .sort({ createdAt: -1 })
        .select("amount createdAt _id location wasteType");
      res.status(200).json(reports);
    }
  } catch (error) {
    console.error("Some Error Occured", error);
    res.status(500).send("Internal Server Error");
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    await getDBConnection();
    const userId = req.userId;
    if (!userId) {
      return res.status(401).send("You are not Authenticated.");
    }
    const { notificationId } = req.body;
    const updatedNotification = await Notifications.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );
    if (!updatedNotification) {
      return res.status(404).send("No such Notification found");
    }
    res
      .status(200)
      .json({ msg: "Notification Marked as Read", updatedNotification });
  } catch (error) {}
};

export const markAllNotificationRead = async (req, res) => {
  try {
    await getDBConnection();
    const userId = req.userId;
    if (!userId) {
      return res.status(401).send("You are not Authenticated.");
    }
    await Notifications.updateMany({ userId }, { isRead: true });
    res.status(200).send("All Notifications Marked as Read");
  } catch (error) {
    console.error("Some Error Occured", error);
    res.status(500).send("Internal Server Error");
  }
};
