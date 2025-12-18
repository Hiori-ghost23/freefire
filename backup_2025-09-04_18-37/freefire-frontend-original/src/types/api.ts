export interface User {
  id: number;
  email: string;
  role: "user" | "organizer" | "admin";
  email_verified_at: string | null;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  password_confirmation: string;
}

export interface CatalogItem {
  id: string;
  type: "DIAMONDS" | "SUBSCRIPTION" | "PASS" | "LEVEL_UP" | "SPECIAL_DROP" | "ACCES_EVO";
  title: string;
  sku: string;
  price_amount: number;
  price_currency: "XOF";
  attributes: Record<string, any>;
  image_url: string | null;
  active: boolean;
}

export interface Tournament {
  id: number;
  visibility: "public" | "private";
  mode: "BR_SOLO" | "BR_DUO" | "BR_SQUAD" | "CLASH_SQUAD" | "LONE_WOLF" | "ROOM_HS";
  reward_text: string | null;
  description: string | null;
  start_at: string;
  status: "pending" | "approved" | "active" | "completed";
  entry_fee_id: string | null;
  contact_whatsapp: string | null;
  ticket_code: string | null;
  created_at: string;
}

export interface ApiError {
  detail: string;
  status_code: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}
