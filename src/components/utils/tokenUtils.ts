import { jwtDecode } from "jwt-decode";
import { User } from "@/types/user";

interface DecodedToken {
  id: string;
  name: string;
  role: "submitter" | "approver";
  exp: number;
  iat: number;
}

// Decode JWT and return User object if token is valid
export const decodeToken = (token: string): User | null => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);

    // Check if token is expired
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      return null;
    }

    return {
      _id: decoded.id,
      name: decoded.name,
      role: decoded.role,
    };
  } catch (error) {
    return null;
  }
};

// Check if a JWT token is still valid
export const isTokenValid = (token: string): boolean => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch {
    return false;
  }
};
