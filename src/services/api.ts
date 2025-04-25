import axios from "axios";
import { useAuthStore } from "../store/authStore";
import { isTokenExpired } from "../utils/tokenUtils";
import { toast } from "sonner";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      if (isTokenExpired(token)) {
        useAuthStore.getState().logout();

        toast.error("Session expired", {
          description: "Your session has expired. Please log in again.",
        });

        window.location.href = "/login";

        return Promise.reject(new Error("Session expired"));
      }

      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      if (error.response.data?.message?.includes("Invalid or expired token")) {
        useAuthStore.getState().logout();

        toast.error("Session expired", {
          description: "Your session has expired. Please log in again.",
        });

        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
