import type { Metadata } from "next";
import { Quicksand, Be_Vietnam_Pro } from "next/font/google";
import Providers from "./providers";
import "./globals.css";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "HH Education - Nền tảng Học tập Trực tuyến Tiên tiến",
  description:
    "Học tập trực tuyến hiệu quả cùng đội ngũ giáo viên giàu kinh nghiệm, bài giảng chất lượng và lộ trình cá nhân hóa.",
  keywords: "học trực tuyến, ôn thi thpt, toán, văn, anh, lý, hóa",
};

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${beVietnamPro.variable} ${quicksand.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'dark';
                  if (theme === 'light') {
                    document.documentElement.classList.add('light');
                  } else {
                    document.documentElement.classList.remove('light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
        <Toaster position="top-right" richColors closeButton theme="dark" />
      </body>
    </html>
  );
}
