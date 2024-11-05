import { Report, Rewards, User } from "../db/Schemas.js";

export const impactController = async (req, res) => {
  try {
    // Count the total number of reports
    const totalReports = await Report.countDocuments();

    // Sum the total amount of waste collected from the Report collection where status is verified and there is collector id present.
    const totalWasteData = await Report.aggregate([
      {
        $match: {
          status: "verified" || "Verified" || "VERIFIED",
          collectorId: { $exists: true, $ne: null },
        },
      },
      {
        $addFields: {
          numericAmount: {
            $convert: {
              input: {
                $trim: {
                  input: "$amount",
                  chars:
                    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ ",
                },
              },
              to: "double",
              onError: 0,
              onNull: 0,
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          totalWaste: { $sum: "$numericAmount" },
        },
      },
    ]);
    const totalWasteCollected = totalWasteData[0]?.totalWaste || 0;

    // Sum the total tokens earned from the Rewards collection
    const totalTokensData = await Rewards.aggregate([
      { $group: { _id: null, totalTokens: { $sum: "$points" } } },
    ]);
    const totalTokensEarned = totalTokensData[0]?.totalTokens || 0;
    const co2Offset = totalWasteCollected * 0.5; // Assuming 0.5 kg CO2 offset per kg of waste

    // Send the aggregated data as response
    res.status(200).json({
      reportsSubmitted: totalReports,
      wasteCollected: totalWasteCollected,
      tokensEarned: totalTokensEarned,
      co2Offset: Math.round(co2Offset * 10) / 10, // Round to 1 decimal place
    });
  } catch (error) {
    console.log(error);
  }
};

function calculateLevel(totalPoints) {
  const maxLevel = 100;
  const maxPoints = 10000;
  const growthFactor = 1.1; // Growth rate for exponential increase

  // Calculate the level using exponential growth
  let level =
    Math.log(
      1 + (totalPoints / maxPoints) * (Math.pow(growthFactor, maxLevel) - 1)
    ) / Math.log(growthFactor);

  // Ensure the level does not exceed maxLevel
  return Math.min(Math.floor(level), maxLevel);
}

export const getLeaderBoard = async (req, res) => {
  try {
    const result = await User.aggregate([
      {
        $lookup: {
          from: "rewards", // The name of the Rewards collection
          localField: "_id", // _id in the User collection
          foreignField: "userId", // userId in Rewards
          as: "rewards",
        },
      },
      {
        $addFields: {
          totalPoints: {
            $sum: {
              $map: {
                input: "$rewards",
                as: "reward",
                in: "$$reward.points",
              },
            },
          },
        },
      },
      {
        $project: {
          userInfo: {
            _id: "$_id",
            name: "$name",
            email: "$email",
          },
          totalPoints: 1,
        },
      },
      {
        $sort: { totalPoints: -1 },
      },
    ]);

    const formattedResult = result.map(user => ({
      userInfo: user.userInfo,
      points: user.totalPoints,
      level: calculateLevel(user.totalPoints)
    }));

    // Send result to frontend
    res.json(formattedResult);
  } catch (err) {
    console.log(err);
  }
};
