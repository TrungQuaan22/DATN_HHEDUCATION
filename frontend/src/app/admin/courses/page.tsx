import type { Metadata } from 'next';
import CoursesListClient from './courses-list-client';

export const metadata: Metadata = {
  title: 'Quản lý Khóa học | HH Education Admin',
  description: 'Trang quản trị danh sách khóa học hệ thống HH Education.',
};

export default function AdminCoursesPage() {
  return <CoursesListClient />;
}
