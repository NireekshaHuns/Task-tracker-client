// src/pages/LogsPage.tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { logService, LogFilters, Log, Submitter } from "../services/logService";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { RefreshCw, Filter } from "lucide-react";
import { format, subDays, subHours } from "date-fns";
import { MainLayout } from "../components/layout/MainLayout";
import usePageMeta from "@/hooks/usePageMeta";

// Simple LoadingSpinner component
const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
};

// Format date and time
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return format(date, "yyyy-MM-dd HH:mm:ss");
};

// Get status color
const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "text-yellow-500";
    case "approved":
      return "text-green-500";
    case "done":
      return "text-blue-500";
    case "rejected":
      return "text-red-500";
    case "deleted":
      return "text-gray-500";
    default:
      return "text-gray-500";
  }
};

// Get action badge color
const getActionBadge = (action: string) => {
  switch (action) {
    case "create":
      return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300";
    case "update":
      return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300";
    case "delete":
      return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300";
    case "status_change":
      return "bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300";
    default:
      return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300";
  }
};

// Time range options for filtering
const timeRangeOptions = [
  { value: "all", label: "All time" },
  { value: "last_day", label: "Last 24 hours" },
  { value: "last_3days", label: "Last 3 days" },
  { value: "last_week", label: "Last 7 days" },
  { value: "last_month", label: "Last 30 days" },
];

const LogsPage = () => {
  const { user } = useAuthStore();

  usePageMeta({
    title: "Activity Logs",
    description:
      "View and filter the complete history of task activities and status changes.",
  });

  // Filters state
  const [filters, setFilters] = useState<LogFilters>({
    limit: 50,
    page: 1,
  });

  // Time range filter
  const [timeRange, setTimeRange] = useState("all");

  // Show filter panel
  const [showFilters, setShowFilters] = useState(false);

  // Apply time range filter
  const applyTimeRangeFilter = (range: string) => {
    const newFilters = { ...filters };
    delete newFilters.startDate;
    delete newFilters.endDate;

    // Calculate date based on selected range
    const now = new Date();

    if (range === "last_day") {
      newFilters.startDate = subHours(now, 24).toISOString();
    } else if (range === "last_3days") {
      newFilters.startDate = subDays(now, 3).toISOString();
    } else if (range === "last_week") {
      newFilters.startDate = subDays(now, 7).toISOString();
    } else if (range === "last_month") {
      newFilters.startDate = subDays(now, 30).toISOString();
    }

    setFilters(newFilters);
    setTimeRange(range);
  };

  // Fetch logs
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["logs", filters],
    queryFn: () => logService.getLogs(filters),
  });

  // Fetch submitters for approver filter
  const { data: submitters = [] } = useQuery({
    queryKey: ["submitters"],
    queryFn: () => logService.getSubmitters(),
    enabled: user?.role === "approver",
  });

  // Handle filter changes
  const handleFilterChange = (key: keyof LogFilters, value: any) => {
    const filterValue = value === "all" ? undefined : value;
    setFilters((prev) => ({ ...prev, [key]: filterValue, page: 1 }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      limit: 50,
      page: 1,
    });
    setTimeRange("all");
  };

  // Handle pagination
  const handlePrevPage = () => {
    if (filters.page && filters.page > 1) {
      setFilters((prev) => ({ ...prev, page: prev.page ? prev.page - 1 : 1 }));
    }
  };

  const handleNextPage = () => {
    if (
      data?.pagination &&
      filters.page &&
      filters.page < data.pagination.pages
    ) {
      setFilters((prev) => ({ ...prev, page: prev.page ? prev.page + 1 : 2 }));
    }
  };

  return (
    <MainLayout
      title="Activity Logs"
      showBackButton={true}
      backButtonPath="/dashboard"
      backButtonText=""
    >
      {/* Controls */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>

          {Object.keys(filters).length > 2 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          className="transition-transform duration-300 hover:rotate-180 cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-md p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 transition-colors duration-300">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Action Type
            </label>
            <Select
              value={filters.action}
              onValueChange={(value) => handleFilterChange("action", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="status_change">Status Change</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              From Status
            </label>
            <Select
              value={filters.fromStatus}
              onValueChange={(value) => handleFilterChange("fromStatus", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="done">Done</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              To Status
            </label>
            <Select
              value={filters.toStatus}
              onValueChange={(value) => handleFilterChange("toStatus", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="done">Done</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="deleted">Deleted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Time Range
            </label>
            <Select value={timeRange} onValueChange={applyTimeRangeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All time" />
              </SelectTrigger>
              <SelectContent>
                {timeRangeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submitter filter - only for approvers */}
          {user?.role === "approver" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Filter by Submitter
              </label>
              <Select
                value={filters.submitterId}
                onValueChange={(value) =>
                  handleFilterChange("submitterId", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All submitters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All submitters</SelectItem>
                  {submitters.map((submitter: Submitter) => (
                    <SelectItem key={submitter._id} value={submitter._id}>
                      {submitter.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Results Per Page
            </label>
            <Select
              value={filters.limit?.toString()}
              onValueChange={(value) =>
                handleFilterChange("limit", Number(value))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="50" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-6 transition-colors duration-300">
          <div className="flex">
            <div>
              <p className="text-red-700 dark:text-red-300">
                Error loading logs:{" "}
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
              <p className="text-red-700 dark:text-red-300 mt-2">
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Retry
                </Button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
          <div className="ml-3 text-gray-500 dark:text-gray-400 transition-colors duration-300">
            Loading logs...
          </div>
        </div>
      ) : data?.logs.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-64">
          <div className="text-gray-500 dark:text-gray-400 mb-4 transition-colors duration-300">
            No log entries found
          </div>
        </div>
      ) : (
        <>
          {/* Logs table */}
          <div className="bg-white dark:bg-gray-800 rounded-md shadow overflow-hidden transition-colors duration-300">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 transition-colors duration-300">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">
                      Task
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-300">
                      Status Change
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
                  {data?.logs.map((log: Log) => (
                    <tr
                      key={log._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-300"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                        {formatDateTime(log.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getActionBadge(
                            log.action
                          )}`}
                        >
                          {log.action.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                        {log.taskTitle}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                        {log.userName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {log.action === "status_change" ? (
                          <div className="flex items-center space-x-2">
                            <span
                              className={getStatusColor(log.fromStatus || "")}
                            >
                              {log.fromStatus}
                            </span>
                            <span className="text-gray-400">→</span>
                            <span className={getStatusColor(log.toStatus)}>
                              {log.toStatus}
                            </span>
                          </div>
                        ) : log.action === "create" ? (
                          <span className={getStatusColor(log.toStatus)}>
                            {log.toStatus}
                          </span>
                        ) : log.action === "delete" ? (
                          <span className={getStatusColor("deleted")}>
                            deleted
                          </span>
                        ) : (
                          <span className={getStatusColor(log.toStatus)}>
                            {log.toStatus}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {data && data.pagination && data.pagination.pages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                Showing {(data.pagination.page - 1) * data.pagination.limit + 1}{" "}
                to{" "}
                {Math.min(
                  data.pagination.page * data.pagination.limit,
                  data.pagination.total
                )}{" "}
                of {data.pagination.total} logs
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={filters.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={filters.page === data.pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </MainLayout>
  );
};

export default LogsPage;
