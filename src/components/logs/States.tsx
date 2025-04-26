// src/components/logs/EmptyState.tsx
import React from "react";

export const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center h-64">
      <div className="mb-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-300 dark:text-gray-600"
        >
          {/* Clipboard base */}
          <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
          <path d="M8 2v4"></path>
          <path d="M16 2v4"></path>
          <path d="M8 3h8"></path>

          {/* Empty state lines */}
          <line x1="8" y1="10" x2="16" y2="10"></line>
          <line x1="8" y1="14" x2="12" y2="14"></line>
          <line x1="8" y1="18" x2="10" y2="18"></line>
        </svg>
      </div>
      <div className="text-gray-500 dark:text-gray-400 mb-1 transition-colors duration-300 text-lg font-medium">
        No log entries found
      </div>
      <p className="text-gray-400 dark:text-gray-500 text-sm max-w-md text-center transition-colors duration-300">
        There are no activity logs to display. Logs will appear here once tasks
        are created or their status changes.
      </p>
    </div>
  );
};
