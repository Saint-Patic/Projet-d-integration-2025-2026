export interface User {
  user_id: number;
  email: string;
  firstname: string;
  lastname: string;
  pseudo: string;
  birthdate: string;
  user_weight?: number;
  user_height?: number;
  foot_size?: number;
  dominant_hand?: string;
  profile_picture?: string;
  user_type: string;
  created_at: string;
  color_mode?: string;
  color_id?: string;
  password_hash?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface RegisterUserData {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  pseudo: string;
  birthdate: string;
  user_weight?: number;
  user_height?: number;
  foot_size?: number;
  dominant_hand?: string;
}
