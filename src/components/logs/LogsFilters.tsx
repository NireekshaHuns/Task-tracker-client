// src/components/logs/LogsFilters.tsx
import React from "react";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Filter } from "lucide-react";
import { LogFilters, Submitter } from "../../services/logService";

// Time range options for filtering
const timeRangeOptions = [
  { value: "all", label: "All time" },
  { value: "last_day", label: "Last 24 hours" },
  { value: "last_3days", label: "Last 3 days" },
  { value: "last_week", label: "Last 7 days" },
  { value: "last_month", label: "Last 30 days" },
];

type LogsFiltersProps = {
  filters: LogFilters;
  timeRange: string;
  showFilters: boolean;
  submitters: Submitter[];
  userRole?: string;
  setShowFilters: (show: boolean) => void;
  handleFilterChange: (key: keyof LogFilters, value: any) => void;
  applyTimeRangeFilter: (range: string) => void;
  clearFilters: () => void;
};

export const LogsFilters: React.FC<LogsFiltersProps> = ({
  filters,
  timeRange,
  showFilters,
  submitters,
  userRole,
  setShowFilters,
  handleFilterChange,
  applyTimeRangeFilter,
  clearFilters,
}) => {
  return (
    <>
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

      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-md p-4 mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 transition-colors duration-300">
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
          {userRole === "approver" && (
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
    </>
  );
};
