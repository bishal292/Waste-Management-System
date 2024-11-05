// Function to create reaward points based on the amount of waste collected within the range of reward points.

import { apiClient } from "@/lib/api-client";
import { SET_REWARD_ROUTE } from "./constant";

/**
 * @param {Number} wasteAmount
 * @param {Number} minReward
 * @param {Number} maxReward
 * @returns {Number} rewardPoints
 */
export function createRewardPoints(wasteAmount, minReward, maxReward) {
  // Here i am assuming that the Maximum wasteAmount can be 1000 and minimum can be 0.
  const rewardRange = maxReward - minReward;
  const rewardPoints = minReward + (wasteAmount / 1000) * rewardRange;
  return Math.round(rewardPoints);
}
