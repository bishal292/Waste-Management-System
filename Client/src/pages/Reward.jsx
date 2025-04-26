import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Coins,
  Gift,
  Loader,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAppStore } from "@/store/store";
import {
  FETCH_TRANSACTIONS_REWARD_ROUTE,
  REDEEM_ALL_REWARD_ROUTE,
  REDEEM_REWARD_ROUTE,
} from "@/utils/constant";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

const Reward = () => {
  const { userInfo } = useAppStore();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);

  useEffect(() => {
    const fetchdata = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(FETCH_TRANSACTIONS_REWARD_ROUTE, {
          withCredentials: true,
        });
        if (response.status === 200 && response.data) {
          const trans = response.data.transactions;
          trans.forEach((transaction) => {
            transaction.date = transaction.date.split("T")[0];
          });
          setTransactions(response.data.transactions);
          setRewards(response.data.rewards);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchdata();
  }, []);

  useEffect(() => {
    if (userInfo) {
      setBalance(userInfo.totalBalance);
    }
  }, [userInfo]);

  const handleRedeemAllPoints = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const toatalpoints = balance;
      const response = await apiClient.patch(
        REDEEM_ALL_REWARD_ROUTE,
        { points: toatalpoints },
        { withCredentials: true }
      );
      if (response.status === 200 && response.data) {
        setTransactions((prevTransactions) => [
          {
            _id: "fjd9w8ef98bsib",
            amount: -toatalpoints,
            date: new Date().toISOString().split("T")[0],
            description: "Redeemed all Points.",
            type: "redeemed_reward",
            userId: userInfo.id,
          },
          ...prevTransactions,
        ]);
        setRewards((prevRewards) =>
          prevRewards.filter((reward) => reward._id !== response.data._id)
        );
      }
    } catch (error) {
      console.error("Error redeeming points:", error);
      toast.error("Error Redeemin Points");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRedeemReward = async (rewardId) => {
    setIsRedeeming(true);
    try {
      const response = await apiClient.patch(
        REDEEM_REWARD_ROUTE,
        { rewardId },
        { withCredentials: true }
      );
      if (response.status === 200 && response.data) {
        setTransactions((prevTransactions) => [
          {
            _id: rewardId,
            amount: rewards.find((reward) => reward._id === rewardId).points,
            date: new Date().toISOString().split("T")[0],
            description: "Redeemed Points.",
            type: "redeemed_reward",
            userId: userInfo.id,
          },
          ...prevTransactions,
        ]);
        setRewards((prevRewards) =>
          prevRewards.filter((reward) => reward._id !== rewardId)
        );
      }
    } catch (error) {
      console.error("Error redeeming reward:", error);
      toast.error("Error Redeemin Reward");
    } finally {
      setIsRedeeming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <Loader className="animate-spin h-8 w-8 text-gray-600" />
      </div>
    );
  }
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">Rewards</h1>
      <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col justify-between h-full border-l-4 border-green-500 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Reward Balance
        </h2>
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center">
            <Coins className="w-10 h-10 mr-3 text-green-500" />
            <div>
              <span className="text-4xl font-bold text-green-500">
                {balance}
              </span>
              <p className="text-sm text-gray-500">Available Points</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Recent Transactions
          </h2>
          <div className="bg-white rounded-xl shadow-md overflow-x-hidden h-[250px]">
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <div
                  key={transaction._id}
                  className="flex items-center justify-between p-4 border-b border-gray-200 last:border-b-0"
                >
                  <div className="flex items-center">
                    {transaction.type === "earned_report" ? (
                      <ArrowUpRight className="w-5 h-5 text-green-500 mr-3" />
                    ) : transaction.type === "earned_collect" ? (
                      <ArrowUpRight className="w-5 h-5 text-blue-500 mr-3" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 text-red-500 mr-3" />
                    )}
                    <div>
                      <p className="font-medium text-gray-800">
                        {transaction.description}
                      </p>
                      <p className="text-sm text-gray-500">
                        {transaction.date}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`font-semibold ${
                      transaction.type.startsWith("earned")
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {transaction.type.startsWith("earned") && "+"}
                    {transaction.amount}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                No transactions yet
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Available Rewards
          </h2>
          <div className="space-y-4">
            {rewards.length > 2 && (
              <div className="space-y-2">
                <Button
                  onClick={handleRedeemAllPoints}
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                  disabled={balance === 0 || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader />
                      <span className="ml-2">Redeeming...</span>
                    </>
                  ) : (
                    <>
                      <Gift className="w-4 h-4 mr-2" />
                      Redeem All Points
                    </>
                  )}
                </Button>
              </div>
            )}
            {rewards.length > 0 ? (
              <>
                {rewards.map((reward) => (
                  <div
                    key={reward._id}
                    className="bg-white p-4 rounded-xl shadow-md"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Reward for {reward.name}ing Waste
                      </h3>
                      <span className="text-green-500 font-semibold">
                        {reward.points} points
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{reward.desc}</p>
                    <p className="text-sm text-gray-500 mb-4">
                      {reward.collectionInfo}
                    </p>
                    <Button
                      onClick={() => handleRedeemReward(reward._id)}
                      className="w-full bg-green-500 hover:bg-green-600 text-white"
                      disabled={balance < reward.cost || isSubmitting || isRedeeming}
                    >
                      {isRedeeming ? (
                        <>
                          <Loader />
                          <span className="ml-2">Redeeming...</span>
                        </>
                      ) : (
                        <>
                          <Gift className="w-4 h-4 mr-2" />
                          Reedeem Reward
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </>
            ) : (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                <div className="flex items-center">
                  <AlertCircle className="h-6 w-6 text-yellow-400 mr-3" />
                  <p className="text-yellow-700">
                    No rewards available at the moment.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reward;
