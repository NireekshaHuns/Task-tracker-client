import { QueryClient } from "@tanstack/react-query";

// Create a React Query client with custom default options
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
