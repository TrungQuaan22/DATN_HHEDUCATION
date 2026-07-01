export type UserRole = 'student' | 'teacher' | 'admin';

export type UserStatus = 'active' | 'inactive';

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  avatarMediaId: string | null;
  avatarUrl: string | null;
  role: UserRole;
  status: UserStatus;
};

export type LoginResponseData = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

export type RegisterResponseData = {
  id: string;
  email: string;
  fullName: string;
  avatarMediaId: string | null;
  avatarUrl: string | null;
  role: UserRole;
  status: UserStatus;
};
