
import { ExtendedUser, UserRole } from './auth';

export interface AuthContextType {
  currentUser: ExtendedUser | null;
  userRole: UserRole | undefined;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  setupMFA: (phoneNumber: string) => Promise<string>;
  completeMFASetup: (verificationId: string, verificationCode: string) => Promise<void>;
  loading: boolean;
  isNewUser: boolean;
  logAuditEvent: (action: string, details: Record<string, any>) => Promise<void>;
  isSuperAdmin: () => boolean;
  isAdmin: () => boolean;
}

