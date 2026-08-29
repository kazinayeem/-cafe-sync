import { useState } from "react";
import { useDispatch } from "react-redux";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { login } from "@/store/userSlice";
import type { AppDispatch } from "@/store";
import axios from "axios";
import { useNavigate, Link } from "react-router";
import { Coffee, Shield, UserCheck, QrCode } from "lucide-react";
import { getBaseApiUrl } from "@/services/apiConfig";

export default function Login() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("12345");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      setError("");

      const res = await axios.post(`${getBaseApiUrl()}/api/users/login`, {
        email,
        password,
      });

      dispatch(
        login({
          name: res.data.user.name,
          email: res.data.user.email,
          role: res.data.user.role,
          token: res.data.token,
          permissions: res.data.user.permissions || [],
        })
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 px-4 py-8 select-none">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-700 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/30 shadow-inner">
            <Coffee className="h-7 w-7" />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              BornoCafe POS
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Specialty Coffee Point-of-Sale & Kitchen System
            </p>
          </div>
        </div>

        {/* Quick Demo Role Fillers */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 text-center block">
            Demo Credentials
          </span>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fillCredentials("admin@gmail.com", "12345")}
              className="h-8 rounded-xl bg-slate-800/80 border-slate-700 hover:bg-slate-700 text-slate-200 text-xs font-bold"
            >
              <Shield className="h-3.5 w-3.5 mr-1 text-amber-400" />
              Admin
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fillCredentials("kazinayeem@gmail.com", "12345")}
              className="h-8 rounded-xl bg-slate-800/80 border-slate-700 hover:bg-slate-700 text-slate-200 text-xs font-bold"
            >
              <UserCheck className="h-3.5 w-3.5 mr-1 text-blue-400" />
              Staff
            </Button>
          </div>
        </div>

        {/* Login Form */}
        <form className="space-y-4" onSubmit={handleLogin}>
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold text-center">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Staff Email Address
            </Label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="staff@bornocafe.com"
              className="h-11 rounded-xl bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Password
            </Label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-11 rounded-xl bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500 font-medium"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-sm shadow-lg shadow-amber-500/20 active:scale-98 transition-all"
          >
            {loading ? "Authenticating..." : "Access Terminal"}
          </Button>
        </form>

        {/* Public QR Menu Shortcut Link */}
        <div className="pt-2 text-center border-t border-slate-800">
          <Link
            to="/menu"
            className="inline-flex items-center gap-1.5 text-xs text-amber-400/80 hover:text-amber-300 font-semibold transition-colors"
          >
            <QrCode className="h-3.5 w-3.5" />
            Open Customer Digital QR Menu →
          </Link>
        </div>
      </div>
    </div>
  );
}
