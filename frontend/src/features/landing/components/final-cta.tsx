"use client";

import { PhoneCall } from "lucide-react";
import { useState } from "react";

export default function FinalCTA() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    subject: "Toán học",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      `Đăng ký thành công cho: ${formData.fullName} - ${formData.phone} (Môn: ${formData.subject})`,
    );
  };

  return (
    <section
      className="py-24 bg-deep-black relative overflow-hidden border-t border-border-dark"
      id="contact"
    >
      {/* Decorative Blur Background Accent */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-pink opacity-5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
        {/* Info Column */}
        <div className="flex flex-col justify-center space-y-8">
          <h2 className="text-[48px] font-[800] text-cream leading-tight">
            Sẵn sàng bứt phá cùng HH Education?
          </h2>
          <p className="text-[20px] text-muted-taupe leading-relaxed">
            Nhận tư vấn lộ trình học tập miễn phí và bộ tài liệu độc quyền dành
            riêng cho bạn.
          </p>

          <div className="flex items-center gap-6">
            <div className="bg-brand-pink text-white w-14 h-14 rounded-lg flex items-center justify-center shadow-l2">
              <PhoneCall size={24} />
            </div>
            <div>
              <div className="text-[14px] text-muted-taupe uppercase font-semibold">
                Hotline hỗ trợ
              </div>
              <div className="text-[24px] font-bold text-cream">1900 6789</div>
            </div>
          </div>
        </div>

        {/* Form Column */}
        <div className="bg-brand-dark p-8 md:p-12 rounded border border-border-dark shadow-l4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[12px] font-semibold text-muted-taupe uppercase">
                Họ và tên
              </label>
              <input
                className="w-full bg-surface-input border border-border-dark rounded-md focus:ring-brand-pink focus:border-brand-pink text-cream p-3 text-[14px] outline-none transition-all focus:ring-1"
                placeholder="Nguyễn Văn A"
                type="text"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[12px] font-semibold text-muted-taupe uppercase">
                Số điện thoại
              </label>
              <input
                className="w-full bg-surface-input border border-border-dark rounded-md focus:ring-brand-pink focus:border-brand-pink text-cream p-3 text-[14px] outline-none transition-all focus:ring-1"
                placeholder="0901 234 567"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[12px] font-semibold text-muted-taupe uppercase">
                Môn học quan tâm
              </label>
              <div className="relative">
                <select
                  className="w-full bg-surface-input border border-border-dark rounded-md focus:ring-brand-pink focus:border-brand-pink text-cream p-3 text-[14px] outline-none transition-all appearance-none cursor-pointer"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                >
                  <option>Toán học</option>
                  <option>Vật lý</option>
                  <option>Ngữ văn</option>
                  <option>Tiếng Anh</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-taupe">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            <button
              className="w-full bg-brand-pink text-white font-bold text-[14px] py-4 rounded shadow-l4 hover:opacity-90 transition-all active:scale-[0.98] cursor-pointer"
              type="submit"
            >
              Đăng ký ngay
            </button>

            <p className="text-center text-[11px] text-muted-taupe">
              Chúng tôi cam kết bảo mật thông tin đăng ký của bạn.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
