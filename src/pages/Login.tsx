import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/authService";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Home } from "lucide-react";
import { toast } from "sonner";
import usePageMeta from "../hooks/usePageMeta";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  // Add page metadata
  usePageMeta({
    title: "Login",
    description:
      "Sign in to your Task Tracker account to manage and track tasks.",
  });

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "submitter" as "submitter" | "approver",
  });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}!`, {
        description: `You are now signed in as a ${data.user.role}.`,
      });
      navigate("/dashboard");
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Login failed";

      if (errorMessage.includes("don't have access as")) {
        toast.error("Role Mismatch", {
          description: errorMessage,
        });
      } else if (errorMessage.includes("Invalid credentials")) {
        toast.error("Authentication Failed", {
          description: "The username or password you entered is incorrect.",
        });
      } else {
        toast.error("Login Failed", {
          description: errorMessage,
        });
      }
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      role: value as "submitter" | "approver",
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      {/* Home button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4"
        onClick={() => navigate("/")}
        title="Back to Home"
      >
        <Home className="h-5 w-5" />
      </Button>

      <div className="flex flex-1 flex-col justify-center items-center px-6 py-12">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
        </div>

        <Card className="w-full max-w-md mt-8">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Sign in as</Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="submitter">Submitter</SelectItem>
                    <SelectItem value="approver">Approver</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  {formData.role === "submitter"
                    ? "Submitters can create and manage tasks."
                    : "Approvers can review and update task status."}
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="ghost" onClick={() => navigate("/register")}>
              Don't have an account? Register
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
