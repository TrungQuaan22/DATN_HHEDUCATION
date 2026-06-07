import { api } from "@/lib/api/axios";
import {
  ListUsersParams,
  ListUsersResponse,
  CreateTeacherRequest,
  CreateManualEnrollmentRequest,
  UserStatus,
  AdminUserItem,
} from "./types";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
};

export const getAdminUsers = async (
  params: ListUsersParams,
): Promise<ListUsersResponse> => {
  const response = await api.get<ApiEnvelope<ListUsersResponse>>(
    "/admin/users",
    {
      params,
    },
  );
  return response.data.data;
};

export const createTeacherAccount = async (
  data: CreateTeacherRequest,
): Promise<AdminUserItem> => {
  const response = await api.post<ApiEnvelope<AdminUserItem>>(
    "/admin/teachers",
    data,
  );
  return response.data.data;
};

export const updateUserStatus = async (
  userId: string,
  status: UserStatus,
): Promise<void> => {
  await api.patch(`/admin/users/${userId}/status`, { status });
};

export const createManualEnrollment = async (
  data: CreateManualEnrollmentRequest,
): Promise<void> => {
  await api.post("/admin/enrollments", data);
};
