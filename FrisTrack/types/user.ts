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

export interface Match {
  id: number;
  name: string;
  team_name_1: string;
  team_name_2: string;
  team_score_1: number;
  team_score_2: number;
  team1_status: string;
  team2_status: string;
  date: string;
  status?: string;
  color?: string;
  isRecording?: boolean;
  hasRecording?: boolean;
  recordingStartTime?: number;
  recordingDuration?: number;
}

export interface Team {
  id: number;
  team_name: string;
  logo?: string;
  playerCount?: number;
  color?: string;
  players?: string[];
  coach_id?: number;
}

export interface TeamPlayer {
  team_id: number;
  team_name: string;
  user_id: number;
  player_name: string;
  role_attack: "handler" | "stack";
  profile_picture?: string;
}
