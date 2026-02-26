export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignUpRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
}

export interface User {
  username: string;
}