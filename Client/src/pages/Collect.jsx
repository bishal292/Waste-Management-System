import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  CheckCircle,
  Clock,
  Loader,
  MapPin,
  Search,
  Trash2,
  Upload,
  Weight,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/store/store";
import { apiClient } from "@/lib/api-client";
import {
  Gemini_Api_key,
  GET_REPORTS_TO_COLLECT,
  SET_REWARD_ROUTE,
  UPDATE_REPORT_STATUS,
} from "@/utils/constant";
import { toast } from "sonner";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createRewardPoints } from "@/utils/utility-Function";

// Utility function component to Style Status Badge for Reports.
function StatusBadge({ status }) {
  const statusConfig = {
    Pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
    in_progress: { color: "bg-blue-100 text-blue-800", icon: Trash2 },
    completed: { color: "bg-green-100 text-green-800", icon: CheckCircle },
    Collected: { color: "bg-purple-100 text-purple-800", icon: CheckCircle },
  };
  const { color, icon: Icon } = statusConfig[status];

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${color} flex items-center`}
    >
      <Icon className="mr-1 h-3 w-3" />
      {status.replace("_", " ")}
    </span>
  );
}

const Collect = () => {
  const { userInfo } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [hoveredWasteType, setHoveredWasteType] = useState(null);
  const [reports, setReports] = useState([]);
  const [paginatedReports, setPaginatedReports] = useState([]);
  const [totalReports, setTotalReports] = useState(0);
  const [selectedTask, setSelectedTask] = useState(null);
  const [verificationImage, setVerificationImage] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState("idle");
  const [verificationResult, setVerificationResult] = useState({
    wasteTypeMatch: "",
    quantityMatch: "",
    confidence: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const pageCount = Math.ceil(totalReports / 5) || 1;
  const user = userInfo.user;

  const fetchReports = async ({ skip, limit }) => {
    if (reports.length === totalReports && totalReports > 0) return;
    try {
      setLoading(true);
      const response = await apiClient.get(GET_REPORTS_TO_COLLECT, {
        withCredentials: true,
        params: { skip, limit },
      });
      if (response.status === 200 && response.data) {
        setTotalReports(response.data.totalReports);
        const resReport = response.data.reports;
        const formattedFetchedReports = resReport.map((report) => ({
          id: report.id,
          location: report.location,
          wasteType: report.wasteType,
          amount: report.amount,
          date: report.date.split("T")[0],
          status: report.status,
          collectorId: report.collectorId,
        }));
        setReports((prevReports) => [
          ...prevReports,
          ...formattedFetchedReports,
        ]);
      }
    } catch (error) {
      console.error("Some Error Occured");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // fetch reports data along with total reports count
    fetchReports({ skip: currentPage * 5 - 5, limit: 5 });
  }, []);
  useEffect(() => {
    const startIndex = (currentPage - 1) * 5;
    const endIndex =
      startIndex + 5 > reports.length ? reports.length : startIndex + 5;
    setPaginatedReports(reports.slice(startIndex, endIndex));
  }, [currentPage, reports]);

  // As the next page is available and next button is clicked fetch next 5 reports data and append it to reports
  const handleNextPageClick = () => {
    setCurrentPage((prev) => Math.min(prev + 1, pageCount));
    fetchReports({ skip: currentPage * 5, limit: 5 });
  };
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const response = await apiClient.patch(
        UPDATE_REPORT_STATUS,
        { reportId: taskId, status: newStatus },
        { withCredentials: true }
      );
      if (response.status === 200 && response.data) {
        const updatedReport = response.data;
        updatedReport.date = updatedReport.date.split("T")[0];
        setReports((prev) =>
          prev.map((task) =>
            task.id === taskId ? { ...task, ...updatedReport } : task
          )
        );
        toast.success("Updated task status successfully!");
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("Failed to update task status. Please try again.");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVerificationImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const readFileAsBase64 = (dataUrl) => {
    return dataUrl.split(",")[1];
  };

  const handleVerify = async () => {
    if (!selectedTask || !verificationImage || !user) {
      toast.error("Missing required information for verification.");
      return;
    }

    setVerificationStatus("verifying");

    try {
      const genAI = new GoogleGenerativeAI(Gemini_Api_key);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const base64Data = readFileAsBase64(verificationImage);

      const imageParts = [
        {
          inlineData: {
            data: base64Data,
            mimeType: "image/jpeg", // Adjust this if you know the exact type
          },
        },
      ];

      const prompt = `You are an expert in waste management and recycling. Analyze this image and provide:
      1. Confirm if the waste type matches it is required to be same: ${selectedTask.wasteType}
      2. Estimate if the quantity matches, ignore some minor difference with compared to: ${selectedTask.amount}
      3. Your confidence level in this assessment (as a percentage)

      Respond strictly in JSON format without any additional text or explanation:
      {
        "wasteTypeMatch": true/false,
        "quantityMatch": true/false,
        "confidence": confidence level as a number between 0 and 1
      }`;

      const result = await model.generateContent([prompt, ...imageParts]);
      let text = result.response.text();

      // Sanitize the response to remove unwanted characters like backticks
      text = text.replace(/```json|```/g, "").trim();

      const parsedResult = JSON.parse(text); // Parse the sanitized JSON
      setVerificationResult({ ...parsedResult });

      if (
        parsedResult.wasteTypeMatch &&
        parsedResult.quantityMatch &&
        parsedResult.confidence > 0.6
      ) {
        const response = await apiClient.patch(
          UPDATE_REPORT_STATUS,
          { reportId: selectedTask.id, status: "Collected" },
          { withCredentials: true }
        );

        if (response.status === 200 && response.data) {
          const points = createRewardPoints(
            parseInt(selectedTask.amount),
            20,
            50
          ); // For collection reward point ranges between 20 -50 based on waste collection.
          const rewardResponse = await apiClient.post(
            SET_REWARD_ROUTE,
            { points, name: "collect" },
            { withCredentials: true }
          );

          if (rewardResponse.status === 201) {
            toast.success(
              `Verification successful! You earned ${points} reward points!`
            );
          } else {
            toast.error(
              "Verification success but failed to save reward points."
            );
          }

          const newUpdatedReport = response.data;
          newUpdatedReport.date = newUpdatedReport.date.split("T")[0];
          setReports((prev) =>
            prev.map((task) =>
              task.id === selectedTask.id
                ? { ...task, ...newUpdatedReport }
                : task
            )
          );

          setVerificationStatus("success");
          setSelectedTask(null); // Close the popup
          setVerificationImage(null); // Clear the uploaded image
          return; // Exit the function after successful verification
        } else {
          toast.error("Internal Server Error. Failed to update task status.");
        }
      } else {
        toast.error(
          "Verification failed. The collected waste does not match the reported waste."
        );
      }
    } catch (error) {
      console.error("Error verifying waste:", error);
    }

    // Set failure status if any error occurs or verification fails
    setVerificationStatus("failure");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">
        Waste Collection Tasks
      </h1>

      <div className="mb-4 flex items-center">
        <Input
          type="text"
          placeholder="Search by area..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mr-2"
        />
        <Button variant="outline" size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin h-8 w-8 text-gray-500" />
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedReports.map((task) => (
              <div
                key={task.id}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-medium text-gray-800 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-gray-500" />
                    {task.location}
                  </h2>
                  <StatusBadge status={task.status} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm text-gray-600 mb-3">
                  <div className="flex items-center relative">
                    <Trash2 className="w-4 h-4 mr-2 text-gray-500" />
                    <span
                      onMouseEnter={() => setHoveredWasteType(task.wasteType)}
                      onMouseLeave={() => setHoveredWasteType(null)}
                      className="cursor-pointer"
                    >
                      {task.wasteType.length > 8
                        ? `${task.wasteType.slice(0, 8)}...`
                        : task.wasteType}
                    </span>
                    {hoveredWasteType === task.wasteType && (
                      <div className="absolute left-0 top-full mt-1 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                        {task.wasteType}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center">
                    <Weight className="w-4 h-4 mr-2 text-gray-500" />
                    {task.amount}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                    {task.date}
                  </div>
                </div>
                <div className="flex justify-end">
                  {task.status === "Pending" && (
                    <Button
                      onClick={() => handleStatusChange(task.id, "in_progress")}
                      variant="outline"
                      size="sm"
                    >
                      Start Collection
                    </Button>
                  )}
                  {task.status === "in_progress" &&
                    task.collectorId === user?.id && (
                      <>
                        <Button
                          onClick={() => handleStatusChange(task.id, "Pending")}
                          variant="outline"
                          size="sm"
                        >
                          Cancel Collection
                        </Button>
                        <Button
                          className="ml-4"
                          onClick={() => setSelectedTask(task)}
                          variant="outline"
                          size="sm"
                        >
                          Complete & Verify
                        </Button>
                      </>
                    )}
                  {task.status === "in_progress" &&
                    task.collectorId !== user?.id && (
                      <span className="text-yellow-600 text-sm font-medium">
                        In progress by another collector
                      </span>
                    )}
                  {task.status === "verified" && (
                    <span className="text-green-600 text-sm font-medium">
                      Reward Earned
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-center">
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="mr-2"
            >
              Previous
            </Button>
            <span className="mx-2 self-center">
              Page {currentPage} of {pageCount}
            </span>
            <Button
              onClick={handleNextPageClick}
              disabled={currentPage === pageCount}
              className="ml-2"
            >
              Next
            </Button>
          </div>
        </>
      )}

      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Verify Collection</h3>
            <p className="mb-4 text-sm text-gray-600">
              Upload a photo of the collected waste to verify and earn your
              reward.
            </p>
            <div className="mb-4">
              <label
                htmlFor="verification-image"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Upload Image
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="verification-image"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="verification-image"
                        name="verification-image"
                        type="file"
                        className="sr-only"
                        onChange={handleImageUpload}
                        accept="image/*"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
            </div>
            {verificationImage && (
              <img
                src={verificationImage}
                alt="Verification"
                className="mb-4 rounded-md max-w-[300px] h-[271px]"
              />
            )}
            <Button
              onClick={handleVerify}
              className="w-full"
              disabled={
                !verificationImage || verificationStatus === "verifying" || !verificationStatus === "success"
              }
            >
              {verificationStatus === "verifying" ? (
                <>
                  <Loader className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Verifying...
                </>
              ) : (<>
                {verificationStatus === "success" ? "Verified" : "Verify Collection"}           
              </>
              )}
            </Button>
            {verificationStatus === "success" && verificationResult && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <h4 className="text-lg font-semibold text-green-800 mb-2">
                  Verification Result
                </h4>
                <p>
                  Waste Type Match:{" "}
                  {verificationResult.wasteTypeMatch ? "Yes" : "No"}
                </p>
                <p>
                  Quantity Match:{" "}
                  {verificationResult.quantityMatch ? "Yes" : "No"}
                </p>
                <p>
                  Confidence: {(verificationResult.confidence * 100).toFixed(2)}
                  %
                </p>
              </div>
            )}
            {verificationStatus === "failure" && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="mt-2 text-red-600 text-center text-sm">
                  Verification failed. Please try again.
                </p>
                <p>
                  Waste Type Match:{" "}
                  {verificationResult.wasteTypeMatch ? "Yes" : "No"}
                </p>
                <p>
                  Quantity Match:{" "}
                  {verificationResult.quantityMatch ? "Yes" : "No"}
                </p>
                <p>
                  Confidence: {(verificationResult.confidence * 100).toFixed(2)}
                  %
                </p>
              </div>
            )}
            <Button
              onClick={() => setSelectedTask(null)}
              variant="outline"
              className="w-full mt-2"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Add a conditional render to show user info or login prompt */}
      {userInfo ? (
        <p className="text-sm text-gray-600 mb-4">
          Logged in as: {userInfo.user?.name}
        </p>
      ) : (
        <p className="text-sm text-red-600 mb-4">
          Please log in to collect waste and earn rewards.
        </p>
      )}
    </div>
  );
};

export default Collect;
