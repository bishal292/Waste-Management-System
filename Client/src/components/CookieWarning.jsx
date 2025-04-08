import React from "react";

const CookieWarning = ({ children }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="relative bg-white rounded-xl shadow-lg p-6 max-w-md text-center">
        {children}
        <h2 className="text-xl font-semibold text-red-600 mb-4">
          Login Cookie Blocked
        </h2>
        <p className="text-gray-700 mb-4">
          Your browser appears to be blocking login cookies. This may happen if
          third-party cookies are disabled.
        </p>
        <p className="text-sm text-gray-600 mt-4">
          To fix this, go to your browser’s settings and allow third-party
          cookies. In Chrome, visit:
          <span className="font-mono bg-gray-100 px-2 py-1 rounded ml-1">
            Settings → Privacy and Security → Cookies and other site data
          </span>
          and choose "Allow all cookies" or add an exception for this site.
        </p>
      </div>
    </div>
  );
};

export default CookieWarning;
