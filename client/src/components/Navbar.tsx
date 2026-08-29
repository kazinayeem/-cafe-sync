import { useState, useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AppDispatch, RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Clock, Coffee, Shield, User as UserIcon, LogOut, QrCode } from "lucide-react";
import { useGetCurrentShiftQuery } from "@/services/shiftApi";

export default function Navbar() {
  const { role, name } = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { data: shiftData } = useGetCurrentShiftQuery();

  const [time, setTime] = useState<string>("");
  const [date, setDate] = useState<string>("");

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
      setDate(
        now.toLocaleDateString([], {
          weekday: "short",
          month: "short",
          day: "numeric",
        })
      );
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isShiftOpen = Boolean(shiftData?.data && shiftData.data.status === "open");

  const handleLogout = () => {
    dispatch({ type: "user/logout" });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="w-full border-b border-border/80 bg-card/80 backdrop-blur-md sticky top-0 z-30 h-16">
      <div className="w-full h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left Side: Sidebar Trigger & Live Clock */}
        <div className="flex items-center gap-3">
          <SidebarTrigger className="h-9 w-9 border border-border/80 rounded-lg hover:bg-accent transition-colors" />

          {/* Real-Time Shift & Time Display */}
          <div className="hidden md:flex items-center gap-3 pl-2 border-l border-border/80">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span className="font-tabular font-semibold text-foreground">{time}</span>
              <span>•</span>
              <span>{date}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Shift Quick Button, QR Menu Link, Theme, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick QR Menu Shortcut */}
          <button
            onClick={() => window.open("/menu", "_blank")}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-border/80 hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
            title="Open Customer-Facing QR Menu"
          >
            <QrCode className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span>QR Menu</span>
          </button>

          {/* Shift Status Button */}
          <button
            onClick={() => navigate("/dashboard/shifts")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isShiftOpen
                ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60"
                : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isShiftOpen ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              }`}
            />
            <span className="hidden sm:inline">{isShiftOpen ? "Shift Active" : "Shift Closed"}</span>
            <span className="sm:hidden">{isShiftOpen ? "Active" : "Closed"}</span>
          </button>

          {/* Theme Toggle */}
          <ModeToggle />

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer p-1 rounded-lg hover:bg-accent transition-colors">
                <Avatar className="h-8 w-8 border border-border/80">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-bold">
                    {name?.slice(0, 2).toUpperCase() || "CS"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold text-foreground leading-none truncate max-w-[120px]">
                    {name || "Staff"}
                  </span>
                  <span className="text-[10px] text-muted-foreground capitalize leading-tight">
                    {role || "Cashier"}
                  </span>
                </div>
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56 p-1.5 shadow-xl rounded-xl border border-border/80" align="end">
              <DropdownMenuLabel className="p-2">
                <div className="flex flex-col space-y-0.5">
                  <p className="text-xs font-bold text-foreground">{name || "Staff"}</p>
                  <p className="text-[11px] text-muted-foreground font-normal capitalize flex items-center gap-1">
                    <Shield className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                    Role: {role || "Staff"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/dashboard/profile")} className="cursor-pointer text-xs font-medium py-2">
                <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                Profile & Password
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/dashboard/shifts")} className="cursor-pointer text-xs font-medium py-2">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                Shift & Cash Drawer
              </DropdownMenuItem>
              {(role === "admin" || role === "manager") && (
                <DropdownMenuItem onClick={() => navigate("/dashboard/settings")} className="cursor-pointer text-xs font-medium py-2">
                  <Coffee className="h-4 w-4 mr-2 text-muted-foreground" />
                  Store Settings
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-xs font-medium py-2 text-destructive focus:bg-destructive/10">
                <LogOut className="h-4 w-4 mr-2 text-destructive" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
