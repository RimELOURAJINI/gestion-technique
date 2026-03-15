export interface User {
  id?: number;
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  token?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  type: string;
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  message?: string;
  error?: boolean;
}