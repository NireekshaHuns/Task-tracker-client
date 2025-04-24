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
  }
  
  export interface RegisterData extends LoginCredentials {
    name: string;
    role: "submitter" | "approver";
  }     