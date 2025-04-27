import React from "react";
import { Button } from "../ui/button";

type ErrorDisplayProps = {
  error: Error | unknown;
  onRetry: () => void;
};

// Error display component with retry button
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
}) => {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-6 transition-colors duration-300">
      <div className="flex">
        <div>
          <p className="text-red-700 dark:text-red-300">
            Error loading logs:{" "}
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
          <p className="text-red-700 dark:text-red-300 mt-2">
            <Button variant="outline" size="sm" onClick={onRetry}>
              Retry
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};
