import { Outlet } from "react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import Navbar from "@/components/Navbar";

export default function Dashboard() {
  return (
    <SidebarProvider className="min-w-full bg-background text-foreground">
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-background">
          <Navbar />
          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-background/50">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
