export interface User {
  _id: string;
  name: string;
  role: "submitter" | "approver";
}

// Response after successful authentication
export interface AuthResponse {
  token: string;
  user: User;
}

// Credentials required for login
export interface LoginCredentials {
  username: string;
  password: string;
  role: "submitter" | "approver";
}

// Payload for user registration
export interface RegisterData extends Omit<LoginCredentials, "role"> {
  name: string;
  role: "submitter" | "approver";
}
