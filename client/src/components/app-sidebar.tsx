import {
  LayoutDashboard,
  Store,
  Receipt,
  CookingPot,
  Grid3X3,
  CalendarCheck,
  Package,
  FolderTree,
  Sliders,
  Users,
  Boxes,
  Clock,
  FileText,
  UserCheck,
  Settings,
  QrCode,
  LogOut,
  Coffee,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";

import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { Link, useLocation, useNavigate } from "react-router";
import { Button } from "./ui/button";
import { useGetSettingsQuery } from "@/services/SettingsApi";
import { useGetCurrentShiftQuery } from "@/services/shiftApi";

export function AppSidebar() {
  const { role, name } = useSelector((state: RootState) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { data: settingsData } = useGetSettingsQuery({});
  const { data: shiftData } = useGetCurrentShiftQuery();

  const businessName = settingsData?.data?.businessName || "Cafe Sync";
  const isShiftOpen = Boolean(shiftData?.data && shiftData.data.status === "open");

  const handleLogout = () => {
    dispatch({ type: "user/logout" });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  // Grouped Navigation Items
  const operationItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Kitchen / KDS", url: "/dashboard/kitchen", icon: CookingPot },
    { title: "Orders", url: "/dashboard/orders", icon: Receipt },
    { title: "Tables & Floor", url: "/dashboard/tables", icon: Grid3X3 },
    { title: "Reservations", url: "/dashboard/reservations", icon: CalendarCheck },
  ];

  const catalogItems = [
    { title: "Menu Items", url: "/dashboard/menu", icon: Package },
    { title: "Categories", url: "/dashboard/categories", icon: FolderTree },
    { title: "Modifiers", url: "/dashboard/modifiers", icon: Sliders },
    { title: "Inventory", url: "/dashboard/inventory", icon: Boxes },
  ];

  const customerItems = [
    { title: "Customers & CRM", url: "/dashboard/customers", icon: Users },
  ];

  const businessItems = [
    { title: "Shifts & Cash", url: "/dashboard/shifts", icon: Clock },
    { title: "Reports & Sales", url: "/dashboard/reports", icon: FileText },
    { title: "Staff Directory", url: "/dashboard/staff", icon: UserCheck },
  ];

  const adminItems = [
    { title: "Settings", url: "/dashboard/settings", icon: Settings },
    { title: "Public QR Menu", url: "/menu", icon: QrCode, external: true },
  ];

  const isAdminOrManager = role === "admin" || role === "manager";

  return (
    <Sidebar className="border-r border-border/80 bg-sidebar">
      {/* Brand Header */}
      <SidebarHeader className="p-4 border-b border-border/80">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500/20 transition-colors">
            <Coffee className="h-6 w-6" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-extrabold text-base tracking-tight text-foreground truncate">
              {businessName}
            </span>
            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Cafe POS System
            </span>
          </div>
        </Link>

        {/* Live Shift Indicator Banner */}
        <div
          onClick={() => navigate("/dashboard/shifts")}
          className={`mt-3 flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
            isShiftOpen
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60"
              : "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60"
          }`}
        >
          <div className="flex items-center gap-1.5 truncate">
            <span
              className={`w-2 h-2 rounded-full ${
                isShiftOpen ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              }`}
            />
            <span>{isShiftOpen ? "Shift Active" : "Shift Closed"}</span>
          </div>
          <span className="text-[10px] text-muted-foreground">→</span>
        </div>
      </SidebarHeader>

      {/* Nav Content */}
      <SidebarContent className="px-2 py-3 space-y-4">
        {/* Operations */}
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
            Operations
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5 mt-1">
              {operationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link
                      to={item.url}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive(item.url)
                          ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold border-l-4 border-amber-500 shadow-xs"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Catalog (Menu, Categories, Modifiers, Inventory) */}
        {isAdminOrManager && (
          <SidebarGroup className="p-0">
            <SidebarGroupLabel className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
              Catalog & Stock
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-0.5 mt-1">
                {catalogItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <Link
                        to={item.url}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          isActive(item.url)
                            ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold border-l-4 border-amber-500 shadow-xs"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        }`}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Customers */}
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
            CRM & Loyalty
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5 mt-1">
              {customerItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link
                      to={item.url}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive(item.url)
                          ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold border-l-4 border-amber-500 shadow-xs"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Business & Shifts */}
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5 mt-1">
              {businessItems
                .filter((item) => isAdminOrManager || item.url === "/dashboard/shifts")
                .map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <Link
                        to={item.url}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          isActive(item.url)
                            ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold border-l-4 border-amber-500 shadow-xs"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        }`}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Administration */}
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
            System
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5 mt-1">
              {adminItems
                .filter((item) => isAdminOrManager || item.external)
                .map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <Link
                        to={item.url}
                        target={item.external ? "_blank" : undefined}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          isActive(item.url)
                            ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold border-l-4 border-amber-500 shadow-xs"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        }`}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer Profile & Logout */}
      <SidebarFooter className="p-3 border-t border-border/80">
        <div className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg bg-accent/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white font-bold text-xs uppercase">
              {name ? name.slice(0, 2) : "CS"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-foreground truncate">
                {name || "Staff Member"}
              </span>
              <span className="text-[10px] text-muted-foreground capitalize truncate">
                {role || "Cashier"}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
