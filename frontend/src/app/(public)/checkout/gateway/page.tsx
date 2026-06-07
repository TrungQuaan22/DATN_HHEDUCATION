"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { formatVND } from "@/lib/utils/format-money";
import { AlertCircle, CheckCircle, Copy, Info, RefreshCw, ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/stores/toast-store";
import { createPaymentAttempt, getOrder } from "@/features/orders/api";
import type { Order } from "@/features/orders/types";

const ACTIVE_PAYMENT_PROVIDER = "sepay";
const PAYMENT_ATTEMPT_PREFIX = "hh-payment-attempt";

const createIdempotencyKey = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `payment-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const getPaymentAttemptKey = (orderId: string, provider: string) => {
  if (typeof window === "undefined") return createIdempotencyKey();

  const storageKey = `${PAYMENT_ATTEMPT_PREFIX}:${orderId}:${provider}`;
  const existing = window.sessionStorage.getItem(storageKey);

  if (existing) return existing;

  const next = createIdempotencyKey();
  window.sessionStorage.setItem(storageKey, next);
  return next;
};

const formatTime = (seconds: number) => {
  const safeSeconds = Math.max(0, seconds);
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

function GatewayPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const loadOrder = useCallback(async () => {
    if (!orderId) {
      router.replace("/checkout/error?code=MISSING_ORDER");
      return;
    }

    try {
      setIsPolling(true);
      let nextOrder = await getOrder(orderId);

      if (
        nextOrder.status === "pending" &&
        nextOrder.totalAmount > 0 &&
        !nextOrder.payment
      ) {
        const paymentAttempt = await createPaymentAttempt({
          orderId: nextOrder.id,
          provider: ACTIVE_PAYMENT_PROVIDER,
          idempotencyKey: getPaymentAttemptKey(nextOrder.id, ACTIVE_PAYMENT_PROVIDER),
        });
        nextOrder = paymentAttempt.order;
      }

      setOrder(nextOrder);

      if (nextOrder.status === "completed") {
        router.replace(
          `/checkout/success?orderId=${nextOrder.id}&amount=${nextOrder.totalAmount}`
        );
        return;
      }

      if (nextOrder.status === "cancelled" || nextOrder.status === "expired") {
        router.replace(
          `/checkout/error?ref=${nextOrder.orderInvoiceNumber}&code=${nextOrder.status.toUpperCase()}`
        );
      }
    } catch (error: any) {
      toast.error(error?.message || "Không thể tải thông tin thanh toán.");
    } finally {
      setIsLoading(false);
      setIsPolling(false);
    }
  }, [orderId, router]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const poller = setInterval(() => {
      void loadOrder();
    }, 3000);

    return () => clearInterval(poller);
  }, [loadOrder]);

  const secondsLeft = useMemo(() => {
    if (!order) return 0;
    return Math.ceil((new Date(order.expiresAt).getTime() - now) / 1000);
  }, [now, order]);

  const copyPaymentCode = async () => {
    if (!order) return;

    try {
      await navigator.clipboard.writeText(order.orderInvoiceNumber);
      toast.success("Đã sao chép mã thanh toán.");
    } catch {
      toast.error("Không thể sao chép mã thanh toán.");
    }
  };

  if (isLoading || !order) {
    return (
      <div className="min-h-screen bg-brand-dark pt-32 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-pink border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const payment = order.payment;

  return (
    <main className="min-h-screen pb-20 pt-28 bg-brand-dark transition-colors duration-200">
      <div className="max-w-[1000px] mx-auto px-6">
        <div className="flex justify-between items-center mb-10 border-b border-border-dark/60 pb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-[20px] font-bold text-cream tracking-tight">
              HH <span className="text-brand-pink font-extrabold">Education Payment</span>
            </h1>
          </div>
          <span className="text-[11px] font-bold text-green-400 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20 flex items-center gap-1.5 tracking-wider uppercase">
            <ShieldCheck size={14} /> Bảo mật
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-5 flex flex-col items-center bg-deep-black border border-border-dark/60 p-6 rounded-xl text-center space-y-6">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-muted-taupe uppercase tracking-widest block">
                Thời gian thanh toán còn lại
              </span>
              <span className="text-[28px] font-extrabold text-brand-pink font-mono block tracking-wider">
                {formatTime(secondsLeft)}
              </span>
            </div>

            <div className="bg-white p-3 rounded-lg shadow-2xl relative w-[240px] h-[240px] flex items-center justify-center group overflow-hidden border border-gray-200">
              {payment?.qrCodeUrl ? (
                <img
                  alt="SePay QR"
                  width={220}
                  height={220}
                  className="object-contain"
                  src={payment.qrCodeUrl}
                />
              ) : (
                <AlertCircle className="text-red-500" size={40} />
              )}
            </div>

            <p className="text-[11px] text-muted-taupe leading-relaxed max-w-[240px]">
              Quét mã QR bằng ứng dụng ngân hàng. Hệ thống sẽ tự xác nhận khi SePay gửi webhook thanh toán.
            </p>
          </div>

          <div className="md:col-span-7 space-y-6">
            <div className="bg-deep-black border border-border-dark/60 p-6 rounded-xl space-y-6">
              <div className="flex items-center justify-between gap-4 border-b border-border-dark/40 pb-4">
                <h3 className="font-bold text-[14px] uppercase tracking-wider text-brand-pink">
                  Thông tin chuyển khoản
                </h3>
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-muted-taupe uppercase tracking-wider">
                  <RefreshCw size={13} className={isPolling ? "animate-spin" : ""} />
                  Đang đối soát
                </span>
              </div>

              <div className="grid grid-cols-2 gap-y-4 text-[13px] md:text-[14px]">
                <div className="text-muted-taupe">Mã đơn hàng</div>
                <div className="font-bold text-cream text-right font-mono">
                  {order.orderInvoiceNumber}
                </div>

                <div className="text-muted-taupe">Số tiền</div>
                <div className="font-extrabold text-brand-pink text-right text-[16px]">
                  {formatVND(order.totalAmount)}
                </div>

                <div className="text-muted-taupe">Trạng thái</div>
                <div className="font-bold text-cream text-right uppercase">{order.status}</div>

                <div className="text-muted-taupe">Nội dung chuyển khoản</div>
                <div className="font-bold text-brand-pink text-right uppercase font-mono">
                  {order.orderInvoiceNumber}
                </div>
              </div>

              <button
                type="button"
                onClick={copyPaymentCode}
                className="w-full rounded-lg border border-border-dark bg-off-black px-4 py-3 text-[13px] font-bold uppercase tracking-wider text-cream transition hover:border-brand-pink hover:text-brand-pink flex items-center justify-center gap-2"
              >
                <Copy size={15} /> Sao chép nội dung chuyển khoản
              </button>

              <div className="bg-brand-pink/5 border border-brand-pink/15 rounded-lg p-3.5 flex items-start gap-2.5 text-[11px] text-muted-taupe leading-relaxed">
                <Info size={16} className="text-brand-pink shrink-0 mt-0.5" />
                <p>
                  Vui lòng nhập đúng nội dung chuyển khoản{" "}
                  <strong className="text-brand-pink uppercase">
                    {order.orderInvoiceNumber}
                  </strong>
                  . Không đóng trang trong lúc hệ thống chờ webhook xác nhận từ SePay.
                </p>
              </div>
            </div>

            <div className="bg-deep-black border border-green-500/20 p-6 rounded-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-border-dark/40 pb-3">
                <CheckCircle size={16} className="text-green-400" />
                <h4 className="font-bold text-[13px] uppercase tracking-wider text-green-400">
                  Tự động kích hoạt khóa học
                </h4>
              </div>
              <p className="text-[12px] text-muted-taupe leading-relaxed">
                Sau khi giao dịch khớp mã đơn và số tiền, khóa học sẽ được cấp vào tài khoản của bạn tự động.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function GatewayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-brand-dark pt-32 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-brand-pink border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <GatewayPageContent />
    </Suspense>
  );
}
