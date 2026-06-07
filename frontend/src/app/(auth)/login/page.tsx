import { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Đăng nhập | HH Education",
  description:
    "Đăng nhập vào tài khoản HH Education của bạn để tiếp tục học tập.",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full bg-deep-black rounded p-8 md:p-10 border border-border-dark shadow-l4 animate-pulse flex items-center justify-center min-h-[300px]">
          <p className="text-muted-text text-sm">Đang tải biểu mẫu...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
