import React from "react";

type ActionBadgeProps = {
  action: string;
};

// Get badge styles based on action type
export const getActionBadge = (action: string) => {
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

// Badge component that shows action with styled label
export const ActionBadge: React.FC<ActionBadgeProps> = ({ action }) => {
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs ${getActionBadge(action)}`}
    >
      {action.replace("_", " ")}
    </span>
  );
};
