export type NotificationType =
  | "new_lesson"
  | "graded"
  | "new_assignment"
  | "upcoming_assessment"
  | "essay_submission";

export type UserNotification = {
  id: string;
  type: NotificationType;
  title: string;
  content: string | null;
  linkUrl: string | null;
  isRead: boolean;
  createdAt: string;
};

export type NotificationListResponse = {
  items: UserNotification[];
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
};
