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
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("12345");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
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

      // Dispatch Redux login
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

      setLoading(false);
      navigate("/dashboard");
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.message || "Login failed");
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <BackgroundLines className="absolute inset-0 z-0" children />

      <div className="relative z-10 flex items-center justify-center w-full">
        <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 text-center">
            ☕ Cafe POS System
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
            Login to manage your cafe orders, track sales, and monitor
            performance
          </p>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {error && <p className="text-red-600 text-center">{error}</p>}

            <LabelInputContainer>
              <Label htmlFor="email" className="dark:text-gray-200">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@cafe.com"
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
    </div>
  );
}

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};
