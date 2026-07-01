"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import PaymentTransactionsListClient from "./payment-transactions-list-client";
import { ROUTES } from "@/lib/constants/routes";

export default function AdminPaymentTransactionsPage() {
  const { role, hasHydrated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && hasHydrated && role !== "admin") {
      router.replace(ROUTES.ADMIN.DASHBOARD);
    }
  }, [mounted, hasHydrated, role, router]);

  if (!mounted || !hasHydrated) return null;

  if (role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-admin-cream font-sans">
        <p className="text-admin-muted">Bạn không có quyền truy cập trang này.</p>
      </div>
    );
  }

  return <PaymentTransactionsListClient />;
}
