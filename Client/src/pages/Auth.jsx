import React from "react";
import { useState } from "react";
import victory from "@/assets/victory.svg";
import background from "@/assets/background.png";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { SIGNUP_ROUTE, LOGIN_ROUTE } from "@/utils/constant";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/store";

export const Auth = () => {
  const navigate = useNavigate();
  const { setUserInfo } = useAppStore();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const validateLogin = () => {
    if (!email.length) {
      toast.error("Email is required");
      return false;
    } else {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        toast.error("Invalid Email");
        return false;
      }
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return false;
    }
    return true;
  };

  const validateSignup = () => {
    if (!email.length) {
      toast.error("Email is required");
      return false;
    } else if (!name.length) {
      toast.error("Name is required");
      return false;
    } else {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        toast.error("Invalid Email");
        return false;
      }
    }
    if (password.length < 3) {
      toast.error("Password must be at least 8 characters long");
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    return true;
  };

  // Login function to authenticate the user along with the toast notification for error handling.
  const handleLogin = async () => {
    try {
      if (validateLogin()) {
        const res = await apiClient.post(
          LOGIN_ROUTE,
          { email, password },
          { withCredentials: true }
        );
        if (res.status === 200) {
          toast.success("Login Successful");
          setUserInfo(res.data);
          navigate("/home");
        }
      }
    } catch (error) {
      // Handle error responses
      if (error.response) {
        // The request was made and the server responded with a status code
        const status = error.response.status;

        if (status === 404) {
          toast.error("User not found with given email");
        } else if (status === 401) {
          toast.error("Invalid credentials");
        } else {
          toast.error("An unknown error occurred");
        }
      } else {
        // Something went wrong with the request itself
        toast.error("Network error. Please try again.");
      }
    }
  };

  const handleSignup = async () => {
    try {
      if (validateSignup()) {
        const res = await apiClient.post(
          SIGNUP_ROUTE,
          { email, password, name },
          { withCredentials: true }
        );
        if (res.status === 201) {
          setUserInfo(res.data.user);
          navigate("/home");
        }
        console.log(res);
      }
    } catch (error) {
      if (error.response.status) {
        const status = error.response.status;
        if (status === 400) {
          toast.error("All fields are required");
        } else if (status === 409) {
          toast.error("User already exists with given email");
        } else {
          toast.error("An unknown error occurred");
        }
      }
    }
  };

  return (
    <div className="h-[100vh] w-[100vw] flex items-center justify-center">
      <div className="h-[80vh] w-[80vw] bg-white border-2 border-white text-opacity-90 shadow-2xl md:w-[90vw] lg:w-[70vw] xl:w-[60vw] rounded-3xl grid xl:grid-cols-2 ">
        <div className="flex flex-col items-center sm:gap-10 gap-5">
          <div className="flex-col items-center justify-center felx">
            <div className="flex items-center justify-center ">
              <h1 className="text-3xl sm:text-5xl font-bold md:text-6xl">
                Welcome
              </h1>
              <img src={victory} alt="Login image" className="h-[100px]" />
            </div>
            <p className="font-medium text-center">
              Login or create an account to continue
            </p>
          </div>
          <div className="flex items-center justify-center w-full">
            <Tabs className="w-3/4" defaultValue="login">
              <TabsList className="w-full bg-transparent rounded-none">
                <TabsTrigger
                  value="login"
                  className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all duration-300"
                >
                  Login
                </TabsTrigger>

                <TabsTrigger
                  value="signup"
                  className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all duration-300"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>
              <TabsContent
                value="login"
                className="flex flex-col gap-5 sm:mt-10 mt-4"
              >
                <Input
                  type="email"
                  placeholder="Enter Your Email"
                  className="p-6 rounded-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <Input
                  type="password"
                  placeholder="Enter Password"
                  className="p-6 rounded-full"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <Button className="p-6 rounded-full" onClick={handleLogin}>
                  Login
                </Button>
              </TabsContent>

              <TabsContent value="signup" className="flex flex-col gap-5">
                <Input
                  type="text"
                  placeholder="Enter Your Name"
                  className="p-5 sm:p-6 rounded-full"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  type="email"
                  placeholder="Enter Your Email"
                  className="p-5 sm:p-6 rounded-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <Input
                  type="password"
                  placeholder="Enter Password"
                  className="p-5 sm:p-6 rounded-full"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  className="p-5 sm:p-6 rounded-full"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button className="p-6 rounded-full" onClick={handleSignup}>
                  Sign Up
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        <div className="items-center justify-center hidden xl:flex">
          <img src={background} alt="Background icon" className="h-[80vh]" />
        </div>
      </div>
    </div>
  );
};

export default Auth;
