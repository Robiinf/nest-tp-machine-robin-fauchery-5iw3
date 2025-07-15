export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
  isEmailVerified: boolean;
  temp?: boolean; // Pour les tokens temporaires 2FA
}

export interface AuthUser {
  id: number;
  email: string;
  role: string;
  isEmailVerified: boolean;
}
