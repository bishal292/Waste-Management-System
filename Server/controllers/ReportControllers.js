import { createRewardPoints } from "../Utils/Util-function.js";
import { Report, Notifications, Rewards, Transaction } from "../db/Schemas.js";
import { getDBConnection } from "../db/dbConfig.js";

export const createReport = async (req, res) => {
  try {
    await getDBConnection();
    const userId = req.userId;
    if (!userId) {
      return res.status(401).send("You are not Authenticated.");
    }
    console.error(req.body);
    const { report } = req.body;
    if (!report) return res.status(400).send("All fields are required");
    const { location, type, amount, imageUrl, verificationResult } = report;
    if (!location || !type || !amount || !verificationResult)
      return res.status(400).send("All fields are required");
    if (amount < 0) return res.status(400).send("Amount can't be negative");

    const points = createRewardPoints(
      parseFloat(report.amount?.replace(/[^\d.]/g, "")),
      10,
      20
    );

    const name = "report";

    const newReport = await Report.create({
      userId,
      location,
      wasteType: type,
      amount,
      imageUrl,
      verificationResult,
    });
    await Rewards.create({
      userId,
      points,
      desc: "points Earned for reporting waste",
      name,
    });
    await Transaction.create({
      userId,
      type: "earned_report",
      amount: points,
      description: "Points earned for reporting waste",
    });
    await Notifications.create({
      userId,
      message: `You have successfully reported a waste of type ${type}.`,
    });
    res.status(201).json(newReport);
  } catch (error) {
    res.status(500).send("Internal Server Error");
    console.error("Some Error Occured", error);
  }
};

export const getRecentReports = async (req, res) => {
  try {
    await getDBConnection();
    const userId = req.userId;
    if (!userId) {
      return res.status(401).send("You are not Authenticated.");
    }

    const { skip, limit } = req.query;
    if (skip && limit) {
      // Ensure both are provided
      const reports = await Report.aggregate([
        {
          $project: {
            id: "$_id",
            location: 1,
            wasteType: 1,
            amount: 1,
            status: 1,
            date: "$createdAt",
            collectorId: 1,
            statusOrder: {
              $switch: {
                branches: [
                  { case: { $eq: ["$status", "Pending"] }, then: 1 },
                  { case: { $eq: ["$status", "in_progress"] }, then: 2 },
                  { case: { $eq: ["$status", "collected"] }, then: 3 },
                ],
                default: 4,
              },
            },
          },
        },
        {
          $sort: {
            statusOrder: 1,
            date: -1,
          },
        },
        { $skip: parseInt(skip) || 0 },
        { $limit: parseInt(limit) || 10 },
      ]);

      const totalReports = await Report.countDocuments();
      return res.status(200).json({ reports, totalReports }); // Add `return` here
    }

    // Only runs if `skip` or `limit` are missing
    return res.status(400).send("Skip and Limit are required");
  } catch (error) {
    console.error("Some Error Occurred:", error);
    res.status(500).send("Internal Server Error");
  }
};

export const updateReport = async (req, res) => {
  try {
    await getDBConnection();
    const userId = req.userId;
    if (!userId) {
      return res.status(401).send("You are not Authenticated.");
    }
    const { reportId, status } = req.body;
    if (!reportId || !status)
      return res.status(400).send("All fields are required");
    try {
      const updatedReport = await Report.findByIdAndUpdate(
        reportId,
        {
          status,
          collectorId: status === "Pending" ? null : userId,
          collectionDate: status === "Collected" ? new Date() : null,
        },
        {
          new: true,
          projection: {
            _id: 1,
            location: 1,
            wasteType: 1,
            amount: 1,
            status: 1,
            createdAt: 1,
            collectorId: 1,
          },
        }
      );
      const formatedReport = {
        id: updatedReport._id,
        location: updatedReport.location,
        wasteType: updatedReport.wasteType,
        amount: updatedReport.amount,
        status: updatedReport.status,
        date: updatedReport.createdAt,
        collectorId: updatedReport.collectorId,
      };
      const rewardPoints = createRewardPoints(
        parseFloat(formatedReport.amount?.replace(/[^\d.]/g, "")),
        20,
        50
      );
      if (status === "Collected") {
        const name = "collect";
        await Rewards.create({
          userId,
          points: rewardPoints,
          desc: `points earned for ${name}ing waste`,
          name,
        });
        await Transaction.create({
          userId: updatedReport.collectorId,
          type: "earned_collect",
          amount: rewardPoints,
          description: "Points earned for collecting waste",
        });
        await Notifications.create({
          userId: updatedReport.collectorId,
          message: `You have successfully collected a waste of type ${formatedReport.wasteType}.`,
        });
      }
      res.status(200).json(formatedReport);
      // }
    } catch (error) {
      console.error("Some Error Occurred:", error);
      res.status(500).send("Internal Server Error");
    }
  } catch (error) {
    console.error("Some Error Occurred:", error);
    res.status(500).send("Internal Server Error");
  }
};
