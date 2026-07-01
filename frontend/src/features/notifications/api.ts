import { api } from "@/lib/api/axios";

import type { NotificationListResponse } from "./types";

type ApiEnvelope<T> = { success: true; data: T };

export async function listNotifications(params?: {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}): Promise<NotificationListResponse> {
  const response = await api.get<ApiEnvelope<NotificationListResponse>>(
    "/notifications",
    {
      params: {
        ...params,
        unreadOnly:
          params?.unreadOnly === undefined
            ? undefined
            : String(params.unreadOnly),
      },
    },
  );
  return response.data.data;
}

export async function markNotificationRead(notificationId: string) {
  const response = await api.patch<
    ApiEnvelope<{ notificationId: string; isRead: true }>
  >(`/notifications/${notificationId}/read`);
  return response.data.data;
}

export async function markAllNotificationsRead() {
  const response = await api.patch<ApiEnvelope<{ updatedCount: number }>>(
    "/notifications/read-all",
  );
  return response.data.data;
}
