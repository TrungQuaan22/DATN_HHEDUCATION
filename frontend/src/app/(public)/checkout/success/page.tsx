"use client";

import { Suspense, useEffect, useState } from "react";
import { useCartStore } from "@/stores/cart-store";
import { formatVND } from "@/lib/utils/format-money";
import { CheckCircle, ArrowRight, Home, GraduationCap, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getOrder } from "@/features/orders/api";
import type { Order } from "@/features/orders/types";

function SuccessPageContent() {
  const clearCart = useCartStore((state) => state.clearCart);
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get("orderId");
  const fallbackRef = searchParams.get("ref") || "OD-" + Math.floor(1000 + Math.random() * 9000);
  const fallbackAmount = parseInt(searchParams.get("amount") || "0", 10);

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(orderId));

  useEffect(() => {
    if (!orderId) {
      clearCart();
      return;
    }

    const load = async () => {
      try {
        const nextOrder = await getOrder(orderId);

        if (nextOrder.status !== "completed") {
          router.replace(`/checkout/gateway?orderId=${nextOrder.id}`);
          return;
        }

        setOrder(nextOrder);
        clearCart();
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [clearCart, orderId, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-dark pt-32 flex flex-col items-center justify-center gap-4">
        <RefreshCw size={40} className="text-brand-pink animate-spin" />
        <p className="text-muted-taupe text-[14px]">Đang xác nhận đơn hàng...</p>
      </div>
    );
  }

  const ref = order?.orderInvoiceNumber || fallbackRef;
  const amount = order?.totalAmount ?? fallbackAmount;

  return (
    <main className="min-h-screen pb-20 pt-32 bg-brand-dark flex flex-col items-center justify-center">
      <div className="w-full max-w-[580px] bg-deep-black border border-border-dark p-8 md:p-10 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-pink/10 opacity-65 blur-[90px] rounded-full pointer-events-none"></div>

        <div className="mb-6 relative">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-brand-pink/10 flex items-center justify-center border-2 border-brand-pink/30 shadow-[0_0_35px_rgba(247,80,162,0.15)]">
            <CheckCircle className="text-brand-pink" size={44} />
          </div>
        </div>

        <h1 className="text-[28px] md:text-[34px] font-extrabold text-cream leading-tight tracking-tight mb-3">
          Thanh toán thành công!
        </h1>
        <p className="text-muted-taupe text-[14px] md:text-[15px] leading-relaxed max-w-[420px] mb-8">
          Khóa học đã được kích hoạt trong tài khoản của bạn. Hãy bắt đầu học ngay khi sẵn sàng.
        </p>

        <div className="w-full bg-brand-dark/50 border border-border-dark p-6 rounded-xl text-left space-y-4 mb-8">
          <h3 className="text-[11px] font-bold text-brand-pink uppercase tracking-widest border-b border-border-dark/65 pb-2 mb-3">
            Chi tiết giao dịch
          </h3>

          <div className="flex justify-between items-center text-[13px] md:text-[14px]">
            <span className="text-muted-taupe">Mã đơn hàng</span>
            <span className="font-bold text-cream font-mono uppercase">{ref}</span>
          </div>

          <div className="flex justify-between items-center text-[13px] md:text-[14px]">
            <span className="text-muted-taupe">Phương thức thanh toán</span>
            <span className="font-bold text-cream">
              {amount > 0 ? "Chuyển khoản / SePay QR" : "Khóa học miễn phí"}
            </span>
          </div>

          <div className="h-px bg-border-dark/65 my-2"></div>

          <div className="flex justify-between items-center text-[13px] md:text-[14px]">
            <span className="font-bold text-cream">Tổng thanh toán</span>
            <span className="font-extrabold text-[18px] text-brand-pink">
              {amount > 0 ? formatVND(amount) : "Miễn phí"}
            </span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full">
          <Link
            href="/student"
            className="flex-1 bg-brand-pink hover:bg-brand-pink/90 text-white font-bold text-[13px] py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wider shadow-lg shadow-brand-pink/20"
          >
            <GraduationCap size={16} />
            <span>Vào lớp học ngay</span>
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/"
            className="flex-1 bg-off-black border border-border-dark hover:bg-brand-dark hover:border-brand-pink/30 text-cream font-bold text-[13px] py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            <Home size={16} />
            <span>Về trang chủ</span>
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-brand-dark pt-32 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-brand-pink border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <SuccessPageContent />
    </Suspense>
  );
}
