import React from "react";

const Settings = () => {
  return (
    <>
      <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="mt-4 text-gray-600">
            Settings page is under construction.
          </p>
        </div>
        <div className="flex justify-center items-center">
          <p className="text-gray-600">Please check back later.</p>
        </div>
        <div className="flex justify-center items-center">
          <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={() => window.history.back()}>
            Go Back
          </button>
        </div>
        <div className="flex justify-center items-center">
          <p className="text-gray-600">
            For any issues, please contact support.
          </p>
        </div>
        <div className="flex justify-center items-center">
          <p className="text-gray-600">Thank you for your patience!</p>
        </div>
      </div>
    </>
  );
};

export default Settings;
