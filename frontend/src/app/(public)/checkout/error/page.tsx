"use client";

import { Suspense } from "react";
import { XCircle, AlertCircle, ArrowLeft, PhoneCall } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

function ErrorPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const ref = searchParams.get("ref") || "OD-" + Math.floor(1000 + Math.random() * 9000);
  const code = searchParams.get("code") || "E021";

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-brand-dark pt-32 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-pink border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Map common error codes to explanations
  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case "EXPIRED":
        return "Giao dịch đã hết hạn thanh toán (Quá thời gian 5 phút).";
      case "CANCELLED":
        return "Giao dịch đã bị hủy bởi người dùng.";
      case "E021":
      default:
        return "Giao dịch bị từ chối bởi ngân hàng phát hành thẻ (Mã lỗi: E021). Vui lòng kiểm tra lại số dư tài khoản.";
    }
  };

  return (
    <main className="min-h-screen pb-20 pt-32 bg-brand-dark flex flex-col items-center justify-center">
      {/* Failure Container Card */}
      <div className="w-full max-w-[580px] bg-deep-black border border-border-dark p-8 md:p-10 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
        {/* Soft atmospheric background glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-red-500/5 opacity-50 blur-[90px] rounded-full pointer-events-none"></div>

        {/* Failure Warning Icon */}
        <div className="mb-6 relative">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-red-500/10 flex items-center justify-center border-2 border-red-500/20 shadow-[0_0_35px_rgba(239,68,68,0.1)] animate-pulse">
            <XCircle className="text-red-400" size={44} />
          </div>
        </div>

        {/* Headlines */}
        <h1 className="text-3xl md:text-4xl font-extrabold text-cream leading-tight tracking-tight mb-3">
          Thanh toán chưa hoàn tất
        </h1>
        <p className="text-muted-taupe text-sm md:text-base leading-relaxed max-w-[420px] mb-8">
          Rất tiếc, đã có lỗi xảy ra trong quá trình xử lý giao dịch. Vui lòng kiểm tra lại thông tin thanh toán hoặc thử phương thức khác.
        </p>

        {/* Error Details Card */}
        <div className="w-full bg-brand-dark/50 border border-border-dark p-6 rounded-xl text-left space-y-4 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-muted-taupe uppercase tracking-widest block">
                Lý do từ chối:
              </span>
              <p className="font-bold text-cream text-sm md:text-sm mt-1 leading-relaxed">
                {getErrorMessage(code)}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Link
            href="/checkout"
            className="flex-1 bg-brand-pink/15 border border-brand-pink/30 hover:bg-brand-pink text-brand-pink hover:text-white font-bold text-sm py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            <ArrowLeft size={16} />
            <span>Thanh toán lại</span>
          </Link>
          <a
            href="tel:19006789"
            className="flex-1 bg-off-black border border-border-dark hover:bg-brand-dark hover:border-brand-pink/30 text-cream font-bold text-sm py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            <PhoneCall size={16} className="text-brand-pink" />
            <span>Hotline hỗ trợ</span>
          </a>
        </div>

        {/* Footer info decoration */}
        <div className="mt-8 pt-6 border-t border-border-dark/65 w-full flex justify-between items-center text-xs text-muted-taupe">
          <span>Đơn hàng: #{ref}</span>
          <span>Hệ thống: HH SecurePay</span>
        </div>
      </div>
    </main>
  );
}

export default function ErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-brand-dark pt-32 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-brand-pink border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <ErrorPageContent />
    </Suspense>
  );
}
