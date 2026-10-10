export interface SessionUser {
  name: string;
  email: string;
  image: string | null;
}

export interface AuthActionResult {
  success: boolean;
  error?: string;
  unverified?: boolean;
  message?: string;
}
