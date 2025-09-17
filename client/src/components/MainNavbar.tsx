import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

export default function MainNavbar() {
  return (
    <header className="w-full border-b bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="text-xl font-bold text-gray-800 dark:text-gray-100">
            <Link to={"/"}>CafeSync</Link>
          </div>
          <div className="flex items-center gap-3">
            <ModeToggle />
            <Button variant="default" size="sm">
              <Link to={"/Login"}>Login</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
