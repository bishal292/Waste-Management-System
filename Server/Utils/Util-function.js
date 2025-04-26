/**
 * @param {Number} wasteAmount -> The amount of waste in kg
 * @param {Number} minReward  -> The minimum reward points
 * @param {Number} maxReward -> The maximum reward points
 * @description This function calculates the reward points based on the waste amount and the given range.
 * @returns {Number} rewardPoints
 */
export function createRewardPoints(wasteAmount, minReward, maxReward) {
    // Here i am assuming that the Maximum wasteAmount can be 1000 and minimum can be 0.
    const rewardRange = maxReward - minReward;
    const rewardPoints = minReward + (wasteAmount / 1000) * rewardRange;
    return Math.round(rewardPoints);
  }
  