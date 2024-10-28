import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { apiClient } from "./lib/api-client";
import { useAppStore } from "./store/store";
import { GET_USER_INFO_ROUTE } from "./utils/constant";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Collect from "./pages/collect";
import Reward from "./pages/Reward";
import Report from "./pages/report";
import Header from "./components/Header";
import SideBar from "./components/SideBar";

// Private Route Wrapper
const PrivateRoutes = ({ children }) => {
  const { userInfo } = useAppStore();
  const isAuthenticated = !!userInfo;
  return isAuthenticated ? children : <Navigate to="/auth" />;
};

// Auth Route Wrapper
const AuthRoutes = ({ children }) => {
  const { userInfo } = useAppStore();
  const isAuthenticated = !!userInfo;
  return isAuthenticated ? <Navigate to="/home" /> : children;
};

// Layout Component for Pages with Header & Sidebar
const HeaderSidebarLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex flex-1">
        <SideBar open={sidebarOpen} />
        <main className="flex-1 p-4 lg:p-8 ml-0 lg:ml-64 transition-all duration-300">
          {children}
        </main>
      </div>
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: "/home",
    element: (
        <HeaderSidebarLayout>
          <Home />
        </HeaderSidebarLayout>
    ),
  },
  {
    path: "/collect",
    element: (
      <PrivateRoutes>
        <HeaderSidebarLayout>
          <Collect />
        </HeaderSidebarLayout>
      </PrivateRoutes>
    ),
  },
  {
    path: "/report",
    element: (
      <PrivateRoutes>
        <HeaderSidebarLayout>
          <Report />
        </HeaderSidebarLayout>
      </PrivateRoutes>
    ),
  },
  {
    path: "/reward",
    element: (
      <PrivateRoutes>
        <HeaderSidebarLayout>
          <Reward />
        </HeaderSidebarLayout>
      </PrivateRoutes>
    ),
  },
  {
    path: "/auth",
    element: (
      <AuthRoutes>
        <Auth />
      </AuthRoutes>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/auth" />, // Redirect to auth page for any other route
  },
]);

// Main App Component
function App() {
  const [loading, setLoading] = useState(true);
  const { userInfo, setUserInfo } = useAppStore();

  useEffect(() => {
    const getUserData = async () => {
      try {
        const res = await apiClient.get(GET_USER_INFO_ROUTE, {
          withCredentials: true,
        });
        if (res.status === 200 && res.data) {
          console.log("Response", res);
          console.log("Data : ",res.data);
          console.log("User: ",res.data.user);
          console.log("Notification : ",res.data.notification);
          setUserInfo(res.data);
        } else {
          setUserInfo(undefined);
        }
      } catch (err) {
        console.log(err);
        setUserInfo(undefined);
      } finally {
        setLoading(false);
      }
    };

    if (!userInfo) {
      getUserData();
    } else {
      setLoading(false);
    }
  }, [userInfo, setUserInfo]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <RouterProvider router={router} />;
}

export default App;
