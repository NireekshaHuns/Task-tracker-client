import { jwtDecode } from "jwt-decode";
import { User } from "@/types/user";

interface DecodedToken {
  id: string;
  name: string;
  role: "submitter" | "approver";
  exp: number;
  iat: number;
}

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
    console.error("Failed to decode token:", error);
    return null;
  }
};

export const isTokenValid = (token: string): boolean => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch {
    return false;
  }
};
