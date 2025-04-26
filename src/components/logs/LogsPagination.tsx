import React from "react";
import { Button } from "../ui/button";

type PaginationData = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

type LogPaginationProps = {
  pagination: PaginationData;
  currentPage: number;
  onPrevPage: () => void;
  onNextPage: () => void;
};

export const LogPagination: React.FC<LogPaginationProps> = ({
  pagination,
  currentPage,
  onPrevPage,
  onNextPage,
}) => {
  return (
    <div className="flex justify-between items-center mt-6">
      <div className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
        Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
        {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
        {pagination.total} logs
      </div>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevPage}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNextPage}
          disabled={currentPage === pagination.pages}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
