import Link from 'next/link';

export default function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-deep-black bg-off-black px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-lg font-extrabold tracking-wider text-cream">
                HH <span className="text-brand-pink">EDUCATION</span>
              </span>
            </Link>
            <p className="text-xs text-muted-text max-w-xs leading-relaxed">
              Nâng tầm tương lai tri thức Việt Nam với các giải pháp giáo dục trực tuyến chất lượng cao, giáo viên tận tụy và công nghệ học tập thích ứng thông minh.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-cream">
              Khóa học
            </span>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/courses?subject=math" className="text-xs text-muted-text hover:text-brand-pink transition-colors">
                  Toán học
                </Link>
              </li>
              <li>
                <Link href="/courses?subject=literature" className="text-xs text-muted-text hover:text-brand-pink transition-colors">
                  Ngữ văn
                </Link>
              </li>
              <li>
                <Link href="/courses?subject=english" className="text-xs text-muted-text hover:text-brand-pink transition-colors">
                  Tiếng Anh
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-cream">
              Thông tin
            </span>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/#teachers" className="text-xs text-muted-text hover:text-brand-pink transition-colors">
                  Đội ngũ giáo viên
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-xs text-muted-text hover:text-brand-pink transition-colors">
                  Tin tức & Chia sẻ
                </Link>
              </li>
              <li>
                <Link href="/#about" className="text-xs text-muted-text hover:text-brand-pink transition-colors">
                  Về chúng tôi
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-cream">
              Liên hệ
            </span>
            <ul className="flex flex-col gap-2 text-xs text-muted-text">
              <li>Email: contact@hheducation.vn</li>
              <li>Hotline: 1900 1234</li>
              <li>Địa chỉ: Hà Nội, Việt Nam</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-deep-black pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-muted-text">
            © {currentYear} HH Education. All rights reserved.
          </span>
          <div className="flex gap-4">
            <Link href="/terms" className="text-xs text-muted-text hover:text-brand-pink">
              Điều khoản dịch vụ
            </Link>
            <Link href="/privacy" className="text-xs text-muted-text hover:text-brand-pink">
              Chính sách bảo mật
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
