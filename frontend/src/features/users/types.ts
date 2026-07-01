import { PaginatedResponseShape } from "@/types/common";

export type UserRole = "admin" | "teacher" | "student";
export type UserStatus = "pending_verification" | "active" | "banned";

export type AdminUserItem = {
  id: string;
  email: string;
  fullName: string;
  avatarMediaId: string | null;
  avatarUrl: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
};

export type ListUsersParams = {
  page?: number;
  limit?: number;
  role?: UserRole;
  status?: UserStatus;
  search?: string;
};

export type ListUsersStats = {
  totalUsers: number;
  totalTeachers: number;
  newUsersLast30Days: number;
};

export type ListUsersResponse = PaginatedResponseShape<AdminUserItem> & {
  stats: ListUsersStats;
};

export type CreateTeacherRequest = {
  fullName: string;
  email: string;
  avatarMediaId: string | null;
  password?: string;
  confirmPassword?: string;
};

export type CreateManualEnrollmentRequest = {
  courseId: string;
  userId: string;
  manualReason?: string | null;
};
