"use client";

import { formatVND } from "@/lib/utils/format-money";
import { ArrowLeft, Wallet, ShieldCheck, ArrowRight, ShoppingBasket } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useCheckoutState } from "@/features/courses/hooks/use-checkout-state";
import { SafeImage } from "@/components/media/safe-image";

export default function CheckoutPage() {
  const {
    items,
    isAuthenticated,
    hasHydrated,
    mounted,
    paymentMethod,
    setPaymentMethod,
    subtotal,
    discount,
    total,
    pendingOrder,
    isCreatingOrder,
    isCancellingOrder,
    handleCheckout,
    continuePendingOrder,
    cancelPendingOrder,
  } = useCheckoutState();

  if (!mounted || !hasHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-brand-dark pt-32 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-pink border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-brand-dark pt-32 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 bg-deep-black flex items-center justify-center rounded-full mb-6 border border-border-dark text-muted-taupe">
          <ShoppingBasket size={28} />
        </div>
        <h2 className="text-xl font-bold text-cream mb-2">Giỏ hàng của bạn đang trống</h2>
        <p className="text-muted-taupe text-sm max-w-sm mb-6 leading-relaxed">
          Vui lòng thêm khóa học vào giỏ hàng trước khi tiến hành thanh toán.
        </p>
        <Link
          href="/courses"
          className="bg-brand-pink text-white px-6 py-3 rounded-lg text-sm font-bold shadow-md hover:opacity-90 active:scale-95 transition-all uppercase tracking-wider"
        >
          Xem danh sách khóa học
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-20 pt-28 bg-brand-dark transition-colors duration-200">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header navigation bar */}
        <div className="flex justify-between items-center mb-10 border-b border-border-dark/60 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-pink/15 rounded-xl flex items-center justify-center shadow-lg border border-brand-pink/20">
              <ShieldCheck className="text-brand-pink" size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-cream tracking-tight leading-none">
                Thanh toán an toàn
              </h1>
              <span className="text-xs text-muted-taupe uppercase tracking-widest font-bold mt-1 block">
                HH SecurePay
              </span>
            </div>
          </div>
          <Link
            href="/cart"
            className="flex items-center gap-2 text-muted-taupe hover:text-brand-pink transition-colors text-sm font-bold uppercase tracking-wider"
          >
            <ArrowLeft size={16} /> Quay lại giỏ hàng
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Checkout Information (Left) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="flex flex-col gap-1.5">
              <h2 className="text-2xl font-extrabold text-cream leading-tight">
                Xác nhận & Thanh toán
              </h2>
              <p className="text-muted-taupe text-sm">
                Chọn phương thức thanh toán phù hợp nhất để hoàn tất ghi danh khóa học.
              </p>
            </div>

            {/* Payment Options Card */}
            <section className="p-6 rounded-xl bg-deep-black border border-border-dark/60 shadow-md space-y-6">
              <div className="flex items-center gap-3 border-b border-border-dark/40 pb-4">
                <Wallet className="text-brand-pink" size={20} />
                <h3 className="font-bold text-sm uppercase tracking-wider text-brand-pink">
                  Phương thức thanh toán
                </h3>
              </div>

              <div className="space-y-4">
                {/* QR Code / Bank Transfer option */}
                <label
                  onClick={() => setPaymentMethod("qr_transfer")}
                  className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:bg-brand-dark/20 ${
                    paymentMethod === "qr_transfer"
                      ? "border-brand-pink bg-brand-pink/5"
                      : "border-border-dark/60 text-muted-taupe"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="payment_method"
                      value="qr_transfer"
                      checked={paymentMethod === "qr_transfer"}
                      onChange={() => setPaymentMethod("qr_transfer")}
                      className="w-4 h-4 text-brand-pink bg-brand-dark border-border-dark focus:ring-brand-pink cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-cream">
                        Quét mã QR chuyển khoản hoặc Cổng SEPAY
                      </span>
                      <span className="text-xs text-muted-taupe mt-0.5">
                        Xử lý tự động trong 30 giây (Khuyên dùng)
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-brand-pink bg-brand-pink/10 px-2 py-0.5 rounded tracking-wide uppercase">
                    AUTO
                  </span>
                </label>

                {/* Credit Card / Visa option */}
                <label
                  onClick={() => setPaymentMethod("credit_card")}
                  className={`hidden items-center justify-between p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:bg-brand-dark/20 ${
                    paymentMethod === "credit_card"
                      ? "border-brand-pink bg-brand-pink/5"
                      : "border-border-dark/60 text-muted-taupe"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="payment_method"
                      value="credit_card"
                      checked={paymentMethod === "credit_card"}
                      onChange={() => setPaymentMethod("credit_card")}
                      className="w-4 h-4 text-brand-pink bg-brand-dark border-border-dark focus:ring-brand-pink cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-cream">
                        Thanh toán Thẻ Quốc Tế
                      </span>
                      <span className="text-xs text-muted-taupe mt-0.5">
                        Hỗ trợ Visa, Mastercard, JCB
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-taupe text-xs font-bold uppercase">
                    <span>Visa</span>
                    <span>•</span>
                    <span>MC</span>
                  </div>
                </label>
              </div>
            </section>
          </div>

          {/* Order Summary (Right) */}
          <aside className="lg:col-span-5">
            <section className="p-6 rounded-xl bg-deep-black border border-border-dark/60 shadow-2xl relative overflow-hidden space-y-6">
              {/* Subtle pink glow effect */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-pink/5 blur-[80px] rounded-full pointer-events-none"></div>

              <div className="flex items-center gap-3 border-b border-border-dark/40 pb-4 relative z-10">
                <ShoppingBasket className="text-brand-pink" size={20} />
                <h3 className="font-bold text-sm uppercase tracking-wider text-brand-pink">
                  Đơn hàng của bạn
                </h3>
              </div>

              {/* Course items preview list */}
              <div className="space-y-4 max-h-[220px] overflow-y-auto custom-scrollbar relative z-10 pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 border border-border-dark bg-brand-dark/40 relative">
                      <SafeImage
                        alt={item.title}
                        fill
                        sizes="64px"
                        className="object-cover"
                        src={item.thumbnailUrl}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-cream truncate">
                        {item.title}
                      </h4>
                      <p className="text-xs text-muted-taupe mt-0.5">
                        Lớp {item.grade} • GV: {item.teacherName}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sm text-cream">
                        {formatVND(item.salePrice ?? item.price)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Calculations pricing breakdown */}
              <div className="border-t border-border-dark/60 pt-4 space-y-3 relative z-10 text-sm">
                <div className="flex justify-between text-muted-taupe">
                  <span>Tạm tính</span>
                  <span className="text-cream">{formatVND(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-muted-taupe">
                    <span>Giảm giá ưu đãi</span>
                    <span className="text-green-400">-{formatVND(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-4 border-t border-border-dark/60">
                  <span className="font-bold text-base text-cream">Tổng cộng</span>
                  <div className="text-right">
                    <span className="text-2xl md:text-2xl font-extrabold text-brand-pink block leading-none">
                      {formatVND(total)}
                    </span>
                    <span className="text-xs text-muted-taupe block mt-1 italic">
                      Đã bao gồm VAT
                    </span>
                  </div>
                </div>
              </div>

              {/* Action checkout button */}
              <button
                onClick={handleCheckout}
                disabled={isCreatingOrder}
                className="w-full bg-brand-pink text-white font-bold text-sm py-4 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group uppercase tracking-wider shadow-lg shadow-brand-pink/20 relative z-10 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                <span>{isCreatingOrder ? "Đang tạo đơn hàng..." : "Xác nhận thanh toán"}</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </section>
          </aside>
        </div>
      </div>

      {pendingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-[460px] rounded-xl border border-border-dark bg-deep-black p-6 shadow-2xl">
            <h2 className="text-lg font-extrabold text-cream">
              Bạn đang có đơn hàng chờ thanh toán
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-taupe">
              Vui lòng tiếp tục thanh toán đơn hàng hiện tại hoặc hủy đơn hàng này trước khi tạo đơn mới.
            </p>
            <div className="mt-5 rounded-lg border border-border-dark bg-brand-dark/40 p-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-taupe">Mã đơn</span>
                <span className="font-bold text-cream">{pendingOrder.orderInvoiceNumber}</span>
              </div>
              <div className="mt-2 flex justify-between gap-4">
                <span className="text-muted-taupe">Tổng tiền</span>
                <span className="font-bold text-brand-pink">
                  {formatVND(pendingOrder.totalAmount)}
                </span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={continuePendingOrder}
                className="rounded-lg bg-brand-pink px-4 py-3 text-sm font-bold uppercase tracking-wider text-white transition hover:opacity-90"
              >
                Tiếp tục thanh toán
              </button>
              <button
                type="button"
                onClick={cancelPendingOrder}
                disabled={isCancellingOrder}
                className="rounded-lg border border-border-dark bg-off-black px-4 py-3 text-sm font-bold uppercase tracking-wider text-cream transition hover:border-brand-pink hover:text-brand-pink disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCancellingOrder ? "Đang hủy..." : "Hủy đơn hàng"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
