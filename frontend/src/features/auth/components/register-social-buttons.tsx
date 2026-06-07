"use client";

import React from "react";
import { Button } from "@/components/ui/button";

export default function RegisterSocialButtons() {
  return (
    <>
      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border-dark"></div>
        </div>
        <div className="relative flex justify-center text-[12px]">
          <span className="px-4 bg-deep-black text-muted-text font-bold">
            Hoặc đăng ký bằng
          </span>
        </div>
      </div>

      {/* Social Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="secondary"
          type="button"
          className="w-full"
          onClick={() => {}}
        >
          <img
            alt="Google"
            className="w-5 h-5 mr-2"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtiZWFbehkPh_VjCh3BbhIqU6T4qaQGFOTmfq_lzq5JcBQYATLXdqnKovyhBldzePPeQ7AczNOnUAxlmNZOGiF0gg8h8vp-fwJvLd2np9HdxTL6LSA0Yh35hx14tmByFeZlXawBUENJXggz5KuE_KgsXwmpMcJ-PnP6NbOdJy_nHrBR_6BExVWAB7cTVxhdKOxhhr9H_CjzCYso8RfPcx3X9BYASz6r73eLhnlD0vG0FHAM8XKHf-cGZze3uk9dVHe_xgN80eYkuE"
          />
          Google
        </Button>

        <Button
          variant="secondary"
          type="button"
          className="w-full text-cream"
          onClick={() => {}}
        >
          <svg
            className="w-5 h-5 text-sky-blue mr-2"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Facebook
        </Button>
      </div>
    </>
  );
}
