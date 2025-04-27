import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Menu, Sun, Moon, UserRound, ShieldUser } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme/ThemeProvider";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Layout props interface
interface MainLayoutProps {
  children: ReactNode;
  title: string;
  showBackButton?: boolean;
  backButtonPath?: string;
  backButtonText?: string;
}

// Main layout component
export const MainLayout = ({
  children,
  title,
  showBackButton = false,
  backButtonPath = "/dashboard",
  backButtonText = "Back to Dashboard",
}: MainLayoutProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();

  // Handle logout action
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Toggle light/dark theme
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="flex items-center mr-4">
                <img
                  src="/src/assets/logo.png"
                  alt="Task Tracker Logo"
                  className="h-8 w-auto"
                />
              </div>
              {showBackButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(backButtonPath)}
                  className="mr-4"
                >
                  <svg
                    className="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  {backButtonText}
                </Button>
              )}
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {title}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <NotificationBell />
              <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                <span className="font-medium">{user?.name}</span>
                {user?.role === "approver" ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex items-center ml-2">
                          <ShieldUser className="h-4 w-4 text-blue-500" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Approver</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex items-center ml-2">
                          <UserRound className="h-4 w-4 text-blue-500" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Submitter</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>

              {/* Hamburger Menu Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="p-2" align="end">
                  <DropdownMenuItem
                    onClick={toggleTheme}
                    className="cursor-pointer"
                  >
                    {theme === "dark" ? (
                      <Sun className="mr-2 h-4 w-4" />
                    ) : (
                      <Moon className="mr-2 h-4 w-4" />
                    )}
                    <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => navigate("/logs")}
                    className="cursor-pointer"
                  >
                    <svg
                      className="mr-2 h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <path d="M14 2v6h6" />
                      <path d="M16 13H8" />
                      <path d="M16 17H8" />
                      <path d="M10 9H8" />
                    </svg>
                    Activity Logs
                  </DropdownMenuItem>

                  {user?.role == "approver" && (
                    <DropdownMenuItem
                      onClick={() => navigate("/analytics")}
                      className="cursor-pointer"
                    >
                      <svg
                        className="mr-2 h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 21H3" />
                        <path d="M21 3v18" />
                        <rect x="5" y="9" width="4" height="12" />
                        <rect x="12" y="13" width="4" height="8" />
                      </svg>
                      Analytics
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};
