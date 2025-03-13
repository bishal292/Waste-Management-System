import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle, Loader, MapPin, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CREATE_REPORT_ROUTE,
  Gemini_Api_key,
  GET_REPORT_ROUTE,
  Location_Api,
} from "@/utils/constant";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { apiClient } from "@/lib/api-client";
import { createRewardPoints } from "@/utils/utility-Function";
import Reward from "./Reward";

const Report = () => {
  const [preview, setPreview] = useState("");
  const [file, setFile] = useState("");
  const [newReport, setNewReport] = useState({
    location: "",
    type: "",
    amount: "",
  });
  const [verificationStatus, setVerificationStatus] = useState();
  const [verificationResult, setVerificationResult] = useState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reports, setReports] = useState([]);

  const fetchReports = async () => {
    try {
      const response = await apiClient.get(GET_REPORT_ROUTE, {
        withCredentials: true,
        // params: {
        //   skip: reports[0].id ? reports.length : 0,
        //   limit: 10,
        // },
      });
      if (response.data) {
        const formattedFetchedReports = response.data.map((report) => ({
          id: report._id,
          location: report.location,
          wasteType: report.wasteType,
          amount: report.amount,
          createdAt: report.createdAt.split("T")[0],
        }));
        setReports(formattedFetchedReports);
      }
    } catch (error) {}
  };

  useEffect(() => {
    fetchReports();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (verificationStatus !== "success") {
      toast.error("Please verify the waste before submitting the report.");
      return;
    }

    setIsSubmitting(true);
    try {
      const createdReport = {
        ...newReport,
        // imageUrl: preview,
        verificationResult,
      };

      // Create reward for reporting waste
      const points = createRewardPoints(parseInt(verificationResult.quantity.match(/\d+/)[0]) , 10 , 20);
      const response = await apiClient.post(
        CREATE_REPORT_ROUTE,
        { report: createdReport,
          reward: { points:points,name:"report"}
         },
        { withCredentials: true }
      );
      if (response.status === 201) {
        const report = response.data;
        toast.success("Report submitted successfully");
        const formattedReport = {
          id: report._id,
          location: report.location,
          wasteType: report.wasteType,
          amount: report.amount,
          createdAt: report.createdAt.split("T")[0],
        };

        setReports([formattedReport, ...reports]);

        setNewReport({
          location: "",
          type: "",
          amount: "",
        });
        setPreview("");
        setFile("");
        setVerificationStatus("");
        setVerificationResult("");
        setIsSubmitting(false);
      }
    } catch (error) {
      setIsSubmitting(false);
      console.error("Failed to submit report:", error);
      toast.error("Failed to submit report. Please try again later.");
    }
  }

  function handleFileChange(e) {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  }

  const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Verify logic to check the waste type and amount including confidence level using Google Generative AI and
  const handleVerify = async () => {
    if (!file) return;

    setVerificationStatus("verifying");

    try {
      const genAI = new GoogleGenerativeAI(Gemini_Api_key);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const base64Data = await readFileAsBase64(file);

      const imageParts = [
        {
          inlineData: {
            data: base64Data.split(",")[1],
            mimeType: file.type,
          },
        },
      ];

      const prompt = `You are an expert in waste management and recycling. Analyze this image and provide:
        1. The type of waste (e.g., plastic, paper, glass, metal, organic)
        2. An estimate of the quantity or amount (in kg or liters)
        3. Your confidence level in this assessment (as a percentage)
        
        Respond in JSON format like this:
        {
          "wasteType": "type of waste",
          "quantity": "estimated quantity with unit",
          "confidence": confidence level as a number between 0 and 1
        }
        if the image cannot be considered as any type of waste or cannot be converted into any waste in future then provide the response like this:
        {
          "message": "Not a waste"
        }

        `;

      const result = await model.generateContent([prompt, ...imageParts]);

      const response = result.response;
      const text = await response.text().match(/\{[^]*\}/); // Extract JSON from response(text between { }  including the braces itself.)
      const parsedResult = JSON.parse(text);

      if (parsedResult.message === "Not a waste") {
        toast.error("The uploaded image does not contain waste.");
        setVerificationStatus("failure");
        return;
      }
      if (
        parsedResult.wasteType &&
        parsedResult.quantity &&
        parsedResult.confidence
      ) {
        toast.success(`Waste categorized as ${parsedResult.wasteType}`);
        setVerificationResult(parsedResult);
        setVerificationStatus("success");
        setNewReport({
          ...newReport,
          type: parsedResult.wasteType,
          amount: parsedResult.quantity,
        });
      } else {
        toast.error("Invalid verification result.");
        console.error("Invalid verification result:", parsedResult);
        setVerificationStatus("failure");
      }
    } catch (error) {
      console.error("Error verifying waste:", error);
      setVerificationStatus("failure");
    }
  };

  function handleInputChange(e) {
    const { name, value } = e.target;
    setNewReport({ ...newReport, [name]: value });
  }

  return (
    <>
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold mb-6 text-gray-800">
          Report waste
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-2xl shadow-lg mb-12"
        >
          <div className="mb-8">
            <label
              htmlFor="waste-image"
              className="block text-lg font-medium text-gray-700 mb-2"
            >
              Upload Waste Image
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-green-500 transition-colors duration-300">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="waste-image"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-green-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="waste-image"
                      name="waste-image"
                      type="file"
                      className="sr-only"
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            </div>
          </div>

          {preview && (
            <div className="mt-4 mb-8">
              <img
                src={preview}
                alt="Waste preview"
                className="max-w-[300px] h-[271px] rounded-xl shadow-md"
              />
            </div>
          )}

          <Button
            type="button"
            onClick={handleVerify}
            className="w-full mb-8 bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg rounded-xl transition-colors duration-300"
            disabled={!file || verificationStatus === "verifying"}
          >
            {verificationStatus === "verifying" ? (
              <>
                <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                Verifying...
              </>
            ) : (
              "Verify Waste"
            )}
          </Button>

          {verificationStatus === "success" && verificationResult && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-8 rounded-r-xl">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 text-green-400 mr-3" />
                <div>
                  <h3 className="text-lg font-medium text-green-800">
                    Verification Successful
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Waste Type: {verificationResult.wasteType}</p>
                    <p>Quantity: {verificationResult.quantity}</p>
                    <p>
                      Confidence:{" "}
                      {(verificationResult.confidence * 100).toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Location
              </label>

              <input
                type="text"
                id="location"
                name="location"
                value={newReport.location}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
                placeholder="Enter waste location"
              />
            </div>
            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Waste Type
              </label>
              <input
                type="text"
                id="type"
                name="type"
                value={newReport.type}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 bg-gray-100"
                placeholder="Verified waste type"
                readOnly
              />
            </div>
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Estimated Amount
              </label>
              <input
                type="text"
                id="amount"
                name="amount"
                value={newReport.amount}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 bg-gray-100"
                placeholder="Verified amount"
                readOnly
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg rounded-xl transition-colors duration-300 flex items-center justify-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                Submitting...
              </>
            ) : (
              "Submit Report"
            )}
          </Button>
        </form>

        <h2 className="text-3xl font-semibold mb-6 text-gray-800">
          Recent Reports
        </h2>
        {reports.length > 0 && reports[0].id ? (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reports.map(
                    (report) =>
                      report.id && (
                        <tr
                          key={report.id}
                          className="hover:bg-gray-50 transition-colors duration-200"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <MapPin className="inline-block w-4 h-4 mr-2 text-green-500" />
                            {report.location.length>15 ? (report.location.slice(0,15)+"...") : report.location}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {report.wasteType.length > 15 ?( report.wasteType.slice(0,15)+"...") : report.wasteType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {report.amount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {report.createdAt}
                          </td>
                        </tr>
                      )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center">
            You have not reported any Waste Yet{" "}
          </p>
        )}
      </div>
    </>
  );
};

export default Report;
