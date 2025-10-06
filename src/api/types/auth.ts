export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  name: string;
  password: string;
}

export interface TokenPair {
  access: string;
  refresh: string;
}

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  role_name: string;
}
