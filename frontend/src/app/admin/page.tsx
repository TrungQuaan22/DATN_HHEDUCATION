'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/courses');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh] text-admin-muted text-sm">
      Đang chuyển hướng...
    </div>
  );
}
