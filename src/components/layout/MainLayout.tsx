import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Button } from "../ui/button";
import { ThemeToggle } from "../theme/ThemeToggle";
import { LogOut } from "lucide-react";

interface MainLayoutProps {
  children: ReactNode;
  title: string;
  showBackButton?: boolean;
  backButtonPath?: string;
  backButtonText?: string;
}

export const MainLayout = ({
  children,
  title,
  showBackButton = false,
  backButtonPath = "/dashboard",
  backButtonText = "Back to Dashboard",
}: MainLayoutProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <header className="bg-white dark:bg-gray-800 shadow transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
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
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">{user?.name}</span>
                <span className="px-2">|</span>
                <span className="capitalize">{user?.role}</span>
              </div>
              <ThemeToggle />
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
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
