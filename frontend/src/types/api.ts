// ============ USER TYPES ============
export interface User {
  id: string | number;
  email: string;
  display_name?: string;
  phone?: string;
  country_code?: string;
  country?: string;
  uid_freefire?: string;
  role: "user" | "organizer" | "admin";
  avatar_url?: string | null;
  email_verified?: boolean;
  email_verified_at?: string | null;
  created_at: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserCreate {
  email: string;
  password: string;
  password_confirmation?: string;
  display_name?: string;
  phone?: string;
  country_code?: string;
  uid_freefire?: string;
}

// ============ AUTH TYPES ============
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
  password_confirmation?: string;
  display_name?: string;
  phone?: string;
  country_code?: string;
  uid_freefire?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// ============ CATALOG TYPES ============
export interface CatalogItem {
  id: string;
  type: string;
  category?: string;
  name: string;
  title?: string;
  sku?: string;
  price_xof: number;
  price_amount?: number;
  price_currency?: "XOF";
  description?: string;
  attributes?: Record<string, any>;
  image_url?: string | null;
  active?: boolean;
  in_stock?: boolean;
}

export interface CatalogItemResponse extends CatalogItem {}

// ============ TOURNAMENT TYPES ============
export interface Tournament {
  id: number | string;
  title?: string;
  name?: string;
  visibility: "public" | "private";
  mode: "BR_SOLO" | "BR_DUO" | "BR_SQUAD" | "CLASH_SQUAD" | "LONE_WOLF" | "ROOM_HS";
  game_mode?: string;
  reward_text?: string | null;
  description?: string | null;
  start_at?: string;
  start_date?: string;
  scheduled_at?: string;
  status: "pending" | "approved" | "active" | "completed" | "open" | "closed";
  entry_fee_id?: string | null;
  entry_fee?: number;
  entry_fee_amount?: number;
  max_participants?: number;
  max_teams?: number;
  current_participants?: number;
  registered_count?: number;
  prize_pool?: number;
  total_prize?: number;
  contact_whatsapp?: string | null;
  ticket_code?: string | null;
  is_private?: boolean;
  created_at: string;
}

export interface TournamentResponse extends Tournament {}

export interface TournamentCreate {
  title: string;
  visibility: "public" | "private";
  mode: string;
  description?: string;
  reward_text?: string;
  start_at: string;
  entry_fee_id?: string;
  contact_whatsapp?: string;
  max_participants?: number;
}

export interface TournamentRegistrationRequest {
  tournament_id: number;
  team_name?: string;
  code?: string;
}

export interface TournamentRegistrationResponse {
  id: string;
  tournament_id: number;
  user_id: string;
  team_name?: string;
  status: string;
  created_at: string;
}

// ============ ORDER TYPES ============
export interface CreateOrderRequest {
  catalog_item_id: string;
  uid_freefire: string;
  quantity?: number;
}

export interface OrderResponse {
  id: string;
  code: string;
  user_id: string;
  catalog_item_id: string;
  catalog_item?: CatalogItem;
  item_name?: string;
  quantity: number;
  total_amount: number;
  amount?: number;
  status: "pending" | "paid" | "delivered" | "cancelled";
  uid_freefire: string;
  created_at: string;
}

// ============ PAYMENT TYPES ============
export interface CheckoutRequest {
  order_code: string;
  method: string;
  phone?: string;
}

export interface CheckoutResponse {
  payment_id: string;
  status: string;
  instructions?: string;
  merchant_number?: string;
}

export interface PaymentResponse {
  id: string;
  order_id: string;
  method: string;
  amount: number;
  status: "pending" | "processing" | "completed" | "failed";
  proof_url?: string;
  created_at: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: "mobile_money" | "international_transfer";
  icon?: string;
}

export interface MethodsResponse {
  country: string;
  currency: string;
  methods: PaymentMethod[];
}

// ============ ENTRY FEE TYPES ============
export interface EntryFeeResponse {
  id: string;
  name: string;
  amount: number;
  currency: string;
}

// ============ GENERIC TYPES ============
export interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
}

export interface SuccessResponse {
  success: boolean;
  message: string;
}

export interface ApiError {
  detail: string;
  status_code?: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}
