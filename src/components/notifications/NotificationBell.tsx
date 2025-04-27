import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { useAuthStore } from "../../store/authStore";
import { formatDistanceToNow } from "date-fns";
import { notificationService } from "../../services/notificationService";
import { toast } from "sonner";

export const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Only show for submitters
  if (user?.role !== "submitter") {
    return null;
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationService.getNotifications,
    refetchInterval: 30000,
    enabled: user?.role === "submitter",
  });

  // Safely extract notifications from the response
  const notifications = data?.notifications || [];
  const unreadCount = notifications.length;

  // Clear all notifications mutation
  const clearNotificationsMutation = useMutation({
    mutationFn: notificationService.clearAllNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notifications cleared");
      setOpen(false);
    },
    onError: () => {
      toast.error("Failed to clear notifications");
    },
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">Notifications</h3>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => clearNotificationsMutation.mutate()}
              disabled={clearNotificationsMutation.isPending}
            >
              Clear all
            </Button>
          )}
        </div>

        <div className="max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Loading notifications...
            </div>
          ) : isError ? (
            <div className="p-4 text-center text-sm text-red-500">
              Error loading notifications
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No notifications
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <p className="text-sm">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
