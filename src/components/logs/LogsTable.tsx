import React from "react";
import { format } from "date-fns";
import { Log } from "../../services/logService";
import { ActionBadge } from "./ActionBadge";
import { StatusBadge } from "./StatusBadge";

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return format(date, "yyyy-MM-dd HH:mm:ss");
};

type LogsTableProps = {
  logs: Log[];
};

export const LogsTable: React.FC<LogsTableProps> = ({ logs }) => {
  return (
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
            {logs.map((log: Log) => (
              <tr
                key={log._id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-300"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                  {formatDateTime(log.timestamp)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <ActionBadge action={log.action} />
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
                      <StatusBadge status={log.fromStatus || ""} />
                      <span className="text-gray-400">→</span>
                      <StatusBadge status={log.toStatus} />
                    </div>
                  ) : log.action === "create" ? (
                    <StatusBadge status={log.toStatus} />
                  ) : log.action === "delete" ? (
                    <StatusBadge status="deleted" />
                  ) : (
                    <StatusBadge status={log.toStatus} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
