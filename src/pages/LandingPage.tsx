// src/pages/LandingPage.tsx
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                Task Tracker
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                className="cursor-pointer"
                variant="ghost"
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
              <Button
                className="cursor-pointer"
                variant="default"
                onClick={() => navigate("/register")}
              >
                Register
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-grow flex flex-col">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                <span className="block">Streamline your</span>
                <span className="block text-blue-600 dark:text-blue-500">
                  workflow
                </span>
              </h1>
              <p className="mt-3 text-base text-gray-500 dark:text-gray-400 sm:mt-5 sm:text-lg">
                A simple, efficient task management application with role-based
                access control. Submit, approve, and track tasks throughout
                their lifecycle.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button
                  className="py-3 px-6 text-base cursor-pointer"
                  onClick={() => navigate("/register")}
                >
                  Get Started
                </Button>
                <Button
                  variant="outline"
                  className="py-3 px-6 text-base cursor-pointer"
                  onClick={() => navigate("/login")}
                >
                  Sign In
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <img
                src="/task-tracker-hero.svg"
                alt="Task management illustration"
                className="w-full h-auto"
                onError={(e) => {
                  // Fallback to a simple SVG if image fails to load
                  (
                    e.target as HTMLImageElement
                  ).src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 500 500' fill='none'%3E%3Crect x='100' y='100' width='300' height='300' rx='20' fill='%234F46E5' opacity='0.1'/%3E%3Crect x='150' y='150' width='200' height='50' rx='5' fill='%234F46E5' opacity='0.3'/%3E%3Crect x='150' y='220' width='200' height='50' rx='5' fill='%234F46E5' opacity='0.3'/%3E%3Crect x='150' y='290' width='200' height='50' rx='5' fill='%234F46E5' opacity='0.3'/%3E%3Ccircle cx='125' cy='175' r='10' fill='%234F46E5'/%3E%3Ccircle cx='125' cy='245' r='10' fill='%234F46E5'/%3E%3Ccircle cx='125' cy='315' r='10' fill='%234F46E5'/%3E%3C/svg%3E`;
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Key Features
            </h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
              Everything you need to manage tasks efficiently
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                Role-Based Access
              </h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Separate roles for submitters and approvers with appropriate
                permissions.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                Kanban Board
              </h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Visualize your workflow with an intuitive drag-and-drop
                interface.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                Activity Logs
              </h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Track all changes with detailed activity logs for
                accountability.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
            <p>© 2025 Task Tracker. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
