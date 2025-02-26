
import { User } from 'firebase/auth';

export type UserRole = 'member' | 'admin' | 'super_admin';

export interface AuditLog {
  userId: string;
  action: string;
  details: Record<string, any>;
  timestamp: number;
}

export interface CustomClaims {
  role?: UserRole;
  mfaEnabled?: boolean;
  emailVerified?: boolean;
}

export interface ExtendedUser extends User {
  role?: UserRole;
  mfaEnabled?: boolean;
}

export interface MFASetupData {
  qrCodeUrl: string;
  secret: string;
}

