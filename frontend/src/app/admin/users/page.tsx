import type { Metadata } from "next";
import UsersListClient from "./users-list-client";

export const metadata: Metadata = {
  title: "Quản lý Người dùng | HH Education Admin",
  description: "Trang quản trị danh sách người dùng hệ thống HH Education.",
};

export default function AdminUsersPage() {
  return <UsersListClient />;
}
