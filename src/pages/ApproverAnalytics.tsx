// src/pages/ApproverAnalyticsPage.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { MainLayout } from "../components/layout/MainLayout";
import ApproverDashboard from "../components/approver/ApproverDashboard";
import usePageMeta from "../hooks/usePageMeta";

const ApproverAnalyticsPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  usePageMeta({
    title: "Task Analytics",
    description: "View task analytics and performance metrics",
  });

  // Check if user is an approver, redirect if not
  useEffect(() => {
    if (user && user.role !== "approver") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  if (!user) {
    return null; // Or a loading indicator
  }

  return (
    <MainLayout
      title="Task Analytics"
      showBackButton={true}
      backButtonPath="/dashboard"
      backButtonText=""
    >
      {user.role === "approver" ? (
        <ApproverDashboard />
      ) : (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500 dark:text-gray-400">
            You do not have permission to view this page.
          </p>
        </div>
      )}
    </MainLayout>
  );
};

export default ApproverAnalyticsPage;
