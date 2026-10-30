import { Outlet, useMatch } from "react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import Navbar from "@/components/Navbar";

export default function Dashboard() {
  const isPosRegister = useMatch({ path: "/dashboard", end: true });

  return (
    <SidebarProvider className="min-w-full bg-background text-foreground">
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-background">
          <Navbar />
          <main
            className={`flex-1 min-h-0 bg-background/50 ${
              isPosRegister ? "flex flex-col overflow-hidden" : "overflow-y-auto"
            }`}
          >
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
