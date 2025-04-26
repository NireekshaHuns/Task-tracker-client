import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { logService, LogFilters } from "../services/logService";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/ui/button";
import { RefreshCw } from "lucide-react";
import { subDays, subHours } from "date-fns";
import { MainLayout } from "../components/layout/MainLayout";
import usePageMeta from "@/hooks/usePageMeta";

import { LogsFilters } from "../components/logs/LogsFilters";
import { LogsTable } from "../components/logs/LogsTable";
import { LogPagination } from "../components/logs/LogsPagination";
import { ErrorDisplay } from "../components/logs/ErrorDisplay";
import { EmptyState } from "../components/logs/States";
import { SkeletonLoader } from "../components/logs/SkeletonLoader";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

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

  // Simulated loading state for UI demonstration
  const [isSimulatedLoading, setIsSimulatedLoading] = useState(false);

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
  const {
    data,
    isLoading: isDataLoading,
    isError,
    error,
    refetch,
  } = useQuery({
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

  // Handle refresh with simulated loading state
  const handleRefresh = () => {
    setIsSimulatedLoading(true);
    refetch();

    // Simulate loading for 3 seconds
    setTimeout(() => {
      setIsSimulatedLoading(false);
    }, 3000);
  };

  // Show simulated loading on initial load too
  useEffect(() => {
    setIsSimulatedLoading(true);

    // Simulate initial loading for 3 seconds
    const timer = setTimeout(() => {
      setIsSimulatedLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Combined loading state (real data loading or simulated)
  const isLoading = isDataLoading || isSimulatedLoading;

  return (
    <MainLayout
      title="Activity Logs"
      showBackButton={true}
      backButtonPath="/dashboard"
      backButtonText=""
    >
      <div>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Activity Logs</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="relative my-6">
          <LogsFilters
            filters={filters}
            timeRange={timeRange}
            showFilters={showFilters}
            submitters={submitters}
            userRole={user?.role}
            setShowFilters={setShowFilters}
            handleFilterChange={handleFilterChange}
            applyTimeRangeFilter={applyTimeRangeFilter}
            clearFilters={clearFilters}
          />

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="absolute top-0 right-0 transition-transform duration-300 hover:rotate-180 cursor-pointer"
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>

        {/* Error state */}
        {isError && <ErrorDisplay error={error} onRetry={handleRefresh} />}

        {/* Loading state */}
        {isLoading ? (
          <>
            {/* Skeleton loader for table */}
            <SkeletonLoader rows={7} />

            {/* Simulated pagination skeleton */}
            <div className="flex justify-between items-center mt-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-64"></div>
              <div className="flex space-x-2">
                <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-20"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-20"></div>
              </div>
            </div>
          </>
        ) : data?.logs.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Logs table */}
            <LogsTable logs={data?.logs || []} />

            {/* Pagination */}
            {data && data.pagination && data.pagination.pages > 1 && (
              <LogPagination
                pagination={data.pagination}
                currentPage={filters.page || 1}
                onPrevPage={handlePrevPage}
                onNextPage={handleNextPage}
              />
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default LogsPage;
