export type UserRole = "RECEPTIONIST" | "NURSE" | "PHYSICIAN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}