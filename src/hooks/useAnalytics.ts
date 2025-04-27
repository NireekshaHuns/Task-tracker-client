import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { taskService } from "../services/taskService";

// Define types for task data
interface TaskData {
  _id: string;
  status: "pending" | "approved" | "done" | "rejected";
  createdAt: string;
  updatedAt?: string;
  createdBy:
    | {
        _id: string;
        name: string;
      }
    | string;
}

// Define types for analytics data
export type TaskStatusCount = {
  name: string;
  value: number;
  color: string;
};

export type TaskMonthlyData = {
  name: string;
  pending: number;
  approved: number;
  done: number;
  rejected: number;
};

export type ApprovalTimeData = {
  name: string;
  average: number;
};

export type SubmitterData = {
  name: string;
  tasks: number;
};

export type TaskAnalyticsData = {
  tasksByStatus: TaskStatusCount[];
  tasksByMonth: TaskMonthlyData[];
  approvalTime: ApprovalTimeData[];
  topSubmitters: SubmitterData[];
};

// Status color mapping
const statusColors: Record<string, string> = {
  pending: "#fbbf24",
  approved: "#34d399",
  done: "#3b82f6",
  rejected: "#ef4444",
};

// Fetch and generate task analytics
export const useTaskAnalytics = () => {
  const {
    data: tasks,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tasks", "analytics"],
    queryFn: () => taskService.getTasks(),
  });

  const [analyticsData, setAnalyticsData] = useState<TaskAnalyticsData | null>(
    null
  );

  useEffect(() => {
    if (!tasks || tasks.length === 0) return;
    const statusCounts: Record<string, number> = {
      pending: 0,
      approved: 0,
      done: 0,
      rejected: 0,
    };

    const monthlyData: Record<
      string,
      { pending: number; approved: number; done: number; rejected: number }
    > = {};

    const approvalTimes: Record<string, number[]> = {};
    const submitterCounts: Record<string, number> = {};

    (tasks as TaskData[]).forEach((task: TaskData) => {
      if (statusCounts[task.status] !== undefined) {
        statusCounts[task.status]++;
      }

      const createdAt = new Date(task.createdAt);
      const monthKey = createdAt.toLocaleString("default", { month: "short" }); // "Jan", "Feb", etc.

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          pending: 0,
          approved: 0,
          done: 0,
          rejected: 0,
        };
      }

      const status = task.status as keyof (typeof monthlyData)[string];
      monthlyData[monthKey][status]++;

      if (task.status === "approved" && task.updatedAt) {
        const createdDate = new Date(task.createdAt).getTime();
        const approvedDate = new Date(task.updatedAt).getTime();
        const hoursDiff = (approvedDate - createdDate) / (1000 * 60 * 60);

        const weekNumber =
          Math.floor((Date.now() - createdDate) / (7 * 24 * 60 * 60 * 1000)) +
          1;
        const weekKey = `Week ${weekNumber}`;

        if (!approvalTimes[weekKey]) {
          approvalTimes[weekKey] = [];
        }
        approvalTimes[weekKey].push(hoursDiff);
      }

      let submitterName = "Unknown";

      if (typeof task.createdBy === "object" && task.createdBy) {
        submitterName = task.createdBy.name || "Unknown";
      } else if (typeof task.createdBy === "string") {
        submitterName = "User " + task.createdBy.substring(0, 6);
      }

      submitterCounts[submitterName] =
        (submitterCounts[submitterName] || 0) + 1;
    });

    const tasksByStatus: TaskStatusCount[] = Object.entries(statusCounts).map(
      ([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize
        value,
        color: statusColors[name] || "#6b7280", // Default gray color if status not found
      })
    );

    const tasksByMonth: TaskMonthlyData[] = Object.entries(monthlyData).map(
      ([name, counts]) => ({
        name,
        ...counts,
      })
    );

    // Calculate average approval times
    const approvalTimeData: ApprovalTimeData[] = Object.entries(
      approvalTimes
    ).map(([name, times]) => {
      const average = times.reduce((sum, time) => sum + time, 0) / times.length;
      return {
        name,
        average: parseFloat(average.toFixed(1)), // Round to 1 decimal place
      };
    });

    // Get top submitters
    const topSubmitters: SubmitterData[] = Object.entries(submitterCounts)
      .map(([name, tasks]) => ({ name, tasks }))
      .sort((a, b) => b.tasks - a.tasks)
      .slice(0, 5); // Top 5

    setAnalyticsData({
      tasksByStatus,
      tasksByMonth: tasksByMonth.sort((a, b) => {
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        return months.indexOf(a.name) - months.indexOf(b.name);
      }),
      approvalTime: approvalTimeData.sort((a, b) => {
        const getWeekNum = (str: string) => parseInt(str.split(" ")[1]);
        return getWeekNum(a.name) - getWeekNum(b.name);
      }),
      topSubmitters,
    });
  }, [tasks]);

  return {
    analyticsData,
    isLoading,
    error,
  };
};
