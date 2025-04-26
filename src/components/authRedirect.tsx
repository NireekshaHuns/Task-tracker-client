import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

interface AuthRedirectProps {
  children: React.ReactNode;
}

const AuthRedirect = ({ children }: AuthRedirectProps) => {
  const { isAuthenticated } = useAuthStore();

  // If user is already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Otherwise, show the login/register component
  return <>{children}</>;
};

export default AuthRedirect;
