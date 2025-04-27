import React from "react";

type StatusBadgeProps = {
  status: string;
};

// Get color class based on status value
export const getStatusColor = (status: string) => {
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

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return <span className={getStatusColor(status)}>{status}</span>;
};
