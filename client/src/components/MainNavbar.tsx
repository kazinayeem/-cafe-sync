import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router";

export default function MainNavbar() {
  const location = useLocation();
  const showNavbar = ["/", "/login"].includes(location.pathname.toLowerCase());

  if (!showNavbar) return null; // Hide navbar on other routes

  return (
    <header className="w-full border-b bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Brand */}
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="CafeSync Logo" className="w-20 h-20" />
            <Link
              to="/"
              className="text-xl font-bold text-gray-800 dark:text-gray-100"
            >
              CafeSync
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <ModeToggle />
            <Button variant="default" size="sm">
              <Link to="/login">Login</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
