import { Report, Rewards } from "../db/Schemas.js";

export const impactController = async (req, res) => {
  try {
    // Count the total number of reports
    const totalReports = await Report.countDocuments();

    // Sum the total amount of waste collected from the Report collection where status is verified and there is collector id present.
    const totalWasteData = await Report.aggregate([
      {
        $match: {
          status: "verified"||"Verified"||"VERIFIED",
          collectorId: { $exists: true, $ne: null }
        },
      },
      {
        $addFields: {
          numericAmount: {
           $convert: {
              input: { $trim: { input: "$amount", chars: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ " } },
              to: "double",
              onError: 0,
              onNull: 0
            }
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
