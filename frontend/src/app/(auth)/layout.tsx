"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SiteFooter from "@/components/layout/site-footer";
import SiteHeader from "@/components/layout/site-header";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col bg-brand-dark transition-colors duration-200">
      {/* Header */}
      <SiteHeader />

      {/* Main Content Area */}
      <main className="flex-grow flex items-center justify-center mt-16 px-4 py-12 relative overflow-hidden min-h-screen">
        {/* Poetic blur decorations */}
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-brand-pink/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[350px] h-[350px] bg-accent-orange/3 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Child pages */}
        <div className="relative z-10 w-full max-w-md">{children}</div>
      </main>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}

