
export type UserRole = 'member' | 'admin' | 'super_admin';

export interface AuditLog {
  userId: string;
  action: string;
  details: Record<string, any>;
  timestamp: number;
}

export interface CustomClaims {
  role?: UserRole;
}

export interface ExtendedUser extends User {
  role?: UserRole;
}
