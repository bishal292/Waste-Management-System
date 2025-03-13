import { Report, Notifications, Rewards, Transaction } from "../db/Schemas.js";
import { getDBConnection } from "../db/dbConfig.js";

export const createReport = async (req, res) => {
  try {
    await getDBConnection();
    const userId = req.userId;
    if (!userId) {
      return res.status(401).send("You are not Authenticated.");
    }
    console.log(req.body);
    const { report, reward } = req.body;
    if (!report || !reward ) return res.status(400).send("All fields are required");
    const { location, type, amount, imageUrl, verificationResult } = report;
    const {points, name} = reward;
    if (!location || !type || !amount || !verificationResult || !points || !name)
      return res.status(400).send("All fields are required");
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
      name
    });
    await Transaction.create({
      userId,
      type:"earned_report",
      amount: points,
      description: "Points earned for reporting waste"
    });
    await Notifications.create({
      userId,
      message: `You have successfully reported a waste of type ${type}.`,
    })
    res.status(201).json(newReport);
  } catch (error) {
    res.status(500).send("Internal Server Error");
    console.log("Some Error Occured", error);
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
          },
        },
        { $sort: { date: -1 } }, // Sort by createdAt in descending order
        { $skip: parseInt(skip) || 0 }, // Default to 0 if skip is not provided
        { $limit: parseInt(limit) || 10 }, // Default to 10 if limit is not provided
      ]);

      const totalReports = await Report.countDocuments();
      return res.status(200).json({ reports, totalReports }); // Add `return` here
    }

    // Only runs if `skip` or `limit` are missing
    return res.status(400).send("Skip and Limit are required");
  } catch (error) {
    console.log("Some Error Occurred:", error);
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
        { status, collectorId: status === "Pending" ? null : userId , collectionDate: status === "Collected" ? new Date() : null },
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
      res.status(200).json(formatedReport);
      // }
    } catch (error) {
      console.log("Some Error Occurred:", error);
      res.status(500).send("Internal Server Error");
    }
  } catch (error) {
    console.log("Some Error Occurred:", error);
    res.status(500).send("Internal Server Error");
  }
};
