import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/authService";
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
import usePageMeta from "@/hooks/usePageMeta";

// Register page for creating a new user account
const Register = () => {
  const navigate = useNavigate();

  usePageMeta({
    title: "Register",
    description:
      "Create a new account to start using Task Tracker's powerful task management features.",
  });

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    role: "submitter" as "submitter" | "approver",
  });

  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });

  // Handle registration API call
  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: () => {
      toast.success("Registration successful! Please login");
      navigate("/login");
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Something went wrong";
      toast.error(errorMessage);
    },
  });

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "password") {
      setPasswordChecks({
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /[0-9]/.test(value),
        specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value),
      });
    }
  };

  // Handle role selection
  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      role: value as "submitter" | "approver",
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(formData);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
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
        <div className="w-full max-w-md text-center">
          <h1 className="text-3xl font-bold text-foreground">Task Tracker</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Register to create and manage tasks
          </p>
        </div>

        <Card className="w-full max-w-md mt-8">
          <CardHeader>
            <CardTitle className="text-2xl">Register</CardTitle>
            <CardDescription>
              Create a new account to use the Task Tracker
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

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
                {formData.password.length > 0 && (
                  <div className="mt-2 space-y-1 text-sm animate-fade-slide">
                    <p
                      className={
                        passwordChecks.length
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {passwordChecks.length ? "✓" : "✗"} At least 8 characters
                    </p>
                    <p
                      className={
                        passwordChecks.uppercase
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {passwordChecks.uppercase ? "✓" : "✗"} At least one
                      uppercase letter
                    </p>
                    <p
                      className={
                        passwordChecks.lowercase
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {passwordChecks.lowercase ? "✓" : "✗"} At least one
                      lowercase letter
                    </p>
                    <p
                      className={
                        passwordChecks.number
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {passwordChecks.number ? "✓" : "✗"} At least one number
                    </p>
                    <p
                      className={
                        passwordChecks.specialChar
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {passwordChecks.specialChar ? "✓" : "✗"} At least one
                      special character
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
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
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "Registering..." : "Register"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="ghost" onClick={() => navigate("/login")}>
              Already have an account? Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Register;
