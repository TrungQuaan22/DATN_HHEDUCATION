import { Metadata } from 'next';
import { Suspense } from 'react';
import { RegisterForm } from '@/features/auth/components/register-form';

export const metadata: Metadata = {
  title: 'Đăng ký | HH Education',
  description: 'Đăng ký tài khoản HH Education để tham gia các khóa học hữu ích.',
};

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="w-full bg-deep-black rounded-xl p-8 md:p-10 border border-border-dark shadow-l4 animate-pulse flex items-center justify-center min-h-[300px]">
        <p className="text-muted-text text-sm">Đang tải biểu mẫu...</p>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
