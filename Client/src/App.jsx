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

const PrivateRoutes = ({ children }) => {
  const { userInfo } = useAppStore();
  const isAunthenicated = userInfo ? true : false;
  return isAunthenicated ? children : <Navigate to="/auth" />;
};

const AuthRoutes = ({ children }) => {
  const { userInfo } = useAppStore();
  const isAunthenicated = userInfo ? true : false;
  return isAunthenicated ? <Navigate to="/home" /> : children;
};

const router = createBrowserRouter([
  {
    path: "/home",
    element: <PrivateRoutes><Home /></PrivateRoutes>,
  },
  {
    path: "/collect",
    element: <PrivateRoutes><Collect /></PrivateRoutes>,
  },
  {
    path: "/report",
    element: <PrivateRoutes><Report /></PrivateRoutes>,
  },
  {
    path: "/reward",
    element: <PrivateRoutes><Reward /></PrivateRoutes>,
  },
  {
    path: "/auth",
    element: <AuthRoutes><Auth /></AuthRoutes>,
  },
  {
    path: "*",
    element: <Navigate to="/auth" />, // redirect to auth page for any other route.
  },
]);

function App() {
  const [loading, setLoading] = useState(true);
  const { userInfo, setUserInfo } = useAppStore();

  useEffect(() => {
    const getUserData = async () => {
      try {
        const res = await apiClient.get(GET_USER_INFO_ROUTE, { withCredentials: true });
        if (res.status === 200 && res.data) {
          console.log(res.data)
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
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
