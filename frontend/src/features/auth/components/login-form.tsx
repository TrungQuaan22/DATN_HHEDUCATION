"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput, useLoginMutation } from "../hooks";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage, UI_MESSAGES } from "@/lib/constants/messages";

export function LoginForm() {
  const [showPassword, setShowPassword] = React.useState(false);
  const searchParams = useSearchParams();
  const isRegistered = searchParams.get("registered") === "true";
  const callbackUrl = searchParams.get("callbackUrl");
  const registerHref = callbackUrl
    ? `/register?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : "/register";

  const {
    mutate: loginMutate,
    error: apiError,
    isPending,
  } = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = (data: LoginInput) => {
    loginMutate(data);
  };

  const errorMessage = apiError
    ? getApiErrorMessage(apiError, UI_MESSAGES.auth.loginFailed)
    : null;

  return (
    <div className="w-full bg-deep-black rounded p-8 md:p-10 border border-border-dark shadow-l4 transition-all duration-300 hover:border-brand-pink/20">
      {/* Auth Tabs */}
      <div className="flex mb-8 bg-brand-dark/50 rounded-lg p-1 border border-border-dark">
        <button className="flex-grow py-2 text-center text-sm font-bold rounded-md bg-brand-pink text-brand-dark transition-all">
          Đăng nhập
        </button>
        <Link
          href={registerHref}
          className="flex-grow py-2 text-center text-sm font-bold rounded-md text-muted-text hover:text-cream transition-colors cursor-pointer"
        >
          Đăng ký
        </Link>
      </div>

      {/* Success/Error Message Container */}
      {(isRegistered || errorMessage) && (
        <div className="mb-6">
          {isRegistered && !errorMessage && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm leading-relaxed">
              Đăng ký tài khoản thành công! Vui lòng đăng nhập để tiếp tục.
            </div>
          )}
          {errorMessage && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm leading-relaxed">
              {errorMessage}
            </div>
          )}
        </div>
      )}

      {/* Form */}
      <form className="space-y-2" onSubmit={handleSubmit(onSubmit)}>
        {/* Email Field */}
        <div>
          <label
            className="block text-sm font-bold text-cream mb-2"
            htmlFor="email"
          >
            Email
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-text z-10">
              <Mail size={18} />
            </span>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              disabled={isPending}
              error={!!errors.email}
              className="pl-11"
              {...register("email")}
            />
          </div>
          {/* Pre-allocated height for validation error to prevent layout shifts */}
          <div className="h-5 mt-1.5">
            {errors.email && (
              <p className="text-xs text-red-500/90 font-medium">
                {errors.email.message}
              </p>
            )}
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label
              className="block text-sm font-bold text-cream"
              htmlFor="password"
            >
              Mật khẩu
            </label>
            <a href="#" className="text-xs text-brand-pink hover:underline">
              Quên mật khẩu?
            </a>
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-text z-10">
              <Lock size={18} />
            </span>
            <Input
              id="password"
              placeholder="••••••••"
              type={showPassword ? "text" : "password"}
              disabled={isPending}
              error={!!errors.password}
              className="pl-11 pr-12"
              {...register("password")}
            />
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-text hover:text-brand-pink transition-colors cursor-pointer z-10"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {/* Pre-allocated height for validation error to prevent layout shifts */}
          <div className="h-10 mt-1.5">
            {errors.password && (
              <p className="text-xs text-red-500/90 font-medium">
                {errors.password.message}
              </p>
            )}
          </div>
        </div>

        {/* Remember login */}
        <div className="flex items-center mb-6">
          <input
            className="w-4 h-4 rounded border-border-dark bg-off-black text-brand-pink focus:ring-brand-pink focus:ring-offset-brand-dark cursor-pointer"
            id="remember"
            type="checkbox"
            disabled={isPending}
            {...register("remember")}
          />
          <label
            className="ml-2.5 text-xs text-muted-text select-none cursor-pointer"
            htmlFor="remember"
          >
            Ghi nhớ đăng nhập
          </label>
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          isLoading={isPending}
        >
          {isPending ? "Đang đăng nhập..." : "Đăng nhập ngay"}
          {!isPending && <ArrowRight size={16} className="ml-2" />}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border-dark"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-4 bg-deep-black text-muted-text font-bold">
            Hoặc
          </span>
        </div>
      </div>

      {/* Social Login */}
      <div className="grid gap-4">
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
          Đăng nhập bằng Google
        </Button>
      </div>

      {/* Switch Text */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-text">
          Chưa có tài khoản?
          <Link
            href={registerHref}
            className="text-brand-pink font-bold hover:underline ml-1 cursor-pointer"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}

