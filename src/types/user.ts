export interface User {
  id: string;
  name: string;
  role: "submitter" | "approver";
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  username: string;
  password: string;
  role: "submitter" | "approver";
}

export interface RegisterData extends Omit<LoginCredentials, 'role'> {
  name: string;
  role: "submitter" | "approver";
}
