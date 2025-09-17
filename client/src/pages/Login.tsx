import { useDispatch } from "react-redux";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BackgroundLines } from "@/components/ui/background-lines";
import { cn } from "@/lib/utils";
import type React from "react";
import { login } from "@/store/userSlice";
import type { AppDispatch } from "@/store";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router";

export default function Login() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      const apiUrl =
        import.meta.env.VITE_API_URL || "https://cafe-sync-mhnc.vercel.app";
      const res = await axios.post(`${apiUrl}/api/users/login`, {
        email,
        password,
      });

      dispatch(
        login({
          name: res.data.user.name,
          email: res.data.user.email,
          role: res.data.user.role,
          token: res.data.token,
        })
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleLogin();
  };

  // Quick-fill buttons
  const fillAdmin = () => {
    setEmail("admin@gmail.com");
    setPassword("12345");
  };

  const fillStaff = () => {
    setEmail("kazinayeem@gmail.com");
    setPassword("12345");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <BackgroundLines className="absolute inset-0 z-0" children />

      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-lg">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <img src="/logo.png" alt="Cafe Logo" className="w-50 h-50 mb-2" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white text-center">
            ☕ Cafe POS System
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-center mt-2">
            Login to manage orders, track sales & monitor your café performance
          </p>
        </div>

        {/* Quick-fill buttons */}
        <div className="flex justify-between gap-3 mb-6">
          <Button
            type="button"
            className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
            onClick={fillAdmin}
          >
            Admin
          </Button>
          <Button
            type="button"
            className="flex-1 bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600"
            onClick={fillStaff}
          >
            Staff
          </Button>
        </div>

        {/* Login Form */}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {error && <p className="text-red-600 text-center">{error}</p>}

          <LabelInputContainer>
            <Label htmlFor="email" className="dark:text-gray-200">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </LabelInputContainer>

          <LabelInputContainer>
            <Label htmlFor="password" className="dark:text-gray-200">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </LabelInputContainer>

          <Button
            type="submit"
            className="mt-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
}

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("flex flex-col space-y-2 w-full", className)}>
    {children}
  </div>
);
