"use client";

import { formatVND } from "@/lib/utils/format-money";
import {
  Trash2,
  ArrowRight,
  BookOpen,
  GraduationCap,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { useCartState } from "@/features/courses/hooks/use-cart-state";
import { SafeImage } from "@/components/media/safe-image";

export default function CartPage() {
  const {
    items,
    mounted,
    promoCode,
    setPromoCode,
    isPromoApplied,
    subtotal,
    automaticDiscount,
    total,
    handleApplyPromo,
    handleRemoveItem,
  } = useCartState();

  if (!mounted) {
    return (
      <div className="min-h-screen bg-brand-dark pt-32 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-pink border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-20 pt-28 bg-brand-dark transition-colors duration-200">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex flex-col gap-2 mb-10">
          <h1 className="text-3xl md:text-5xl font-extrabold text-cream leading-tight">
            Giỏ hàng của bạn
          </h1>
          <p className="text-muted-taupe text-base">
            {items.length > 0
              ? `Bạn đang có ${items.length} khóa học trong giỏ hàng`
              : "Giỏ hàng đang trống"}
          </p>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Cart Table Area */}
            <div className="lg:col-span-8 space-y-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-dark pb-4">
                      <th className="pb-4 font-bold text-xs text-muted-taupe uppercase tracking-widest">
                        Khóa học
                      </th>
                      <th className="pb-4 font-bold text-xs text-muted-taupe uppercase tracking-widest text-center">
                        Giá gốc
                      </th>
                      <th className="pb-4 font-bold text-xs text-muted-taupe uppercase tracking-widest text-center">
                        Giảm
                      </th>
                      <th className="pb-4 font-bold text-xs text-muted-taupe uppercase tracking-widest text-center">
                        Giá thanh toán
                      </th>
                      <th className="pb-4 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-dark/40">
                    {items.map((item) => {
                      const itemDiscount =
                        item.salePrice && item.price
                          ? Math.round(
                              ((item.price - item.salePrice) / item.price) *
                                100
                            )
                          : 0;

                      return (
                        <tr
                          key={item.id}
                          className="group hover:bg-deep-black/35 transition-colors duration-200"
                        >
                          <td className="py-6 pr-4">
                            <div className="flex items-center gap-4">
                              <div className="relative w-28 aspect-video rounded-lg overflow-hidden shrink-0 shadow-md border border-border-dark/50">
                                <SafeImage
                                  alt={item.title}
                                  fill
                                  sizes="112px"
                                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                                  src={item.thumbnailUrl}
                                />
                              </div>
                              <div>
                                <Link
                                  href={`/courses/${item.slug}`}
                                  className="font-bold text-base md:text-base text-cream hover:text-brand-pink transition-colors line-clamp-1"
                                >
                                  {item.title}
                                </Link>
                                <div className="flex items-center gap-1.5 text-muted-taupe text-xs mt-1.5 font-medium">
                                  <GraduationCap
                                    size={14}
                                    className="text-brand-pink"
                                  />
                                  <span>GV: {item.teacherName}</span>
                                  <span className="text-border-dark">•</span>
                                  <span>Lớp {item.grade}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-6 px-4 text-center">
                            <span className="text-muted-taupe line-through text-sm">
                              {formatVND(item.price)}
                            </span>
                          </td>
                          <td className="py-6 px-4 text-center">
                            {itemDiscount > 0 ? (
                              <span className="bg-brand-pink/10 text-brand-pink border border-brand-pink/20 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase">
                                -{itemDiscount}%
                              </span>
                            ) : (
                              <span className="text-muted-taupe text-sm">
                                -
                              </span>
                            )}
                          </td>
                          <td className="py-6 px-4 text-center">
                            <span className="font-bold text-cream text-base md:text-base">
                              {formatVND(item.salePrice ?? item.price)}
                            </span>
                          </td>
                          <td className="py-6 pl-4 text-right">
                            <button
                              onClick={() =>
                                handleRemoveItem(item.id, item.title)
                              }
                              className="p-2 text-muted-taupe hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all active:scale-90 cursor-pointer"
                              title="Xóa khóa học"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="pt-6 border-t border-border-dark/60">
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2 text-sm font-bold text-brand-pink hover:underline uppercase tracking-wider"
                >
                  <BookOpen size={16} /> Tiếp tục tìm khóa học
                </Link>
              </div>
            </div>

            {/* Calculations Sidebar */}
            <div className="lg:col-span-4">
              <div className="bg-deep-black border border-border-dark p-6 rounded-xl shadow-2xl sticky top-28 space-y-6">
                <h3 className="text-lg font-bold text-cream border-b border-border-dark pb-4">
                  Tóm tắt đơn hàng
                </h3>

                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center text-muted-taupe">
                    <span>Tạm tính</span>
                    <span className="text-cream font-medium">
                      {formatVND(subtotal)}
                    </span>
                  </div>
                  {automaticDiscount > 0 && (
                    <div className="flex justify-between items-center text-muted-taupe">
                      <span>Ưu đãi khóa học</span>
                      <span className="text-green-400 font-medium">
                        -{formatVND(automaticDiscount)}
                      </span>
                    </div>
                  )}
                  {isPromoApplied && (
                    <div className="flex justify-between items-center text-muted-taupe">
                      <span>Mã giảm giá</span>
                      <span className="text-green-400 font-medium">
                        Đã áp dụng
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-border-dark space-y-2">
                  <label className="block text-xs font-bold text-muted-taupe uppercase tracking-widest">
                    Mã giảm giá
                  </label>
                  <div className="flex gap-2">
                    <input
                      className="flex-grow bg-brand-dark border border-border-dark focus:border-brand-pink focus:ring-1 focus:ring-brand-pink transition-all outline-none rounded px-3 py-2 text-cream text-sm"
                      placeholder="Nhập mã giảm giá"
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                    />
                    <button
                      onClick={handleApplyPromo}
                      className="bg-brand-pink/10 hover:bg-brand-pink border border-brand-pink/30 hover:border-brand-pink text-brand-pink hover:text-white px-4 py-2 rounded text-xs font-bold transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
                    >
                      Áp dụng
                    </button>
                  </div>
                  <span className="text-xs text-muted-taupe block leading-normal pt-1">
                    Nhập mã giảm giá của bạn nếu có.
                  </span>
                </div>

                <div className="pt-6 border-t border-border-dark flex justify-between items-end">
                  <span className="text-base font-bold text-cream">
                    Tổng cộng
                  </span>
                  <div className="text-right">
                    <span className="text-2xl md:text-3xl font-extrabold text-brand-pink block leading-none">
                      {formatVND(total)}
                    </span>
                    <span className="text-xs text-muted-taupe block mt-1.5 italic">
                      Đã bao gồm thuế & phí
                    </span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="w-full bg-brand-pink text-white py-4 rounded-lg font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group uppercase tracking-wider shadow-lg shadow-brand-pink/20"
                >
                  <span>Tiến hành thanh toán</span>
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="py-20 flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-deep-black flex items-center justify-center rounded-full mb-6 border border-border-dark text-muted-taupe animate-pulse">
              <ShoppingBag size={32} />
            </div>
            <h2 className="text-2xl font-bold text-cream mb-3">
              Giỏ hàng của bạn đang trống!
            </h2>
            <p className="text-muted-taupe text-sm leading-relaxed mb-8">
              Có vẻ như bạn chưa chọn khóa học nào. Hãy khám phá kho tàng kiến
              thức của chúng tôi và tìm kiếm khóa học phù hợp nhất.
            </p>
            <Link
              href="/courses"
              className="bg-brand-pink text-white px-8 py-3.5 rounded-lg text-sm font-bold shadow-md hover:opacity-90 active:scale-95 transition-all uppercase tracking-wider"
            >
              Khám phá khóa học ngay
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
