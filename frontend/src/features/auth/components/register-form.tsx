"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, Lock, User, Key, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput, useRegisterMutation } from "../hooks";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage, UI_MESSAGES } from "@/lib/constants/messages";
import RegisterSocialButtons from "./register-social-buttons";

export function RegisterForm() {
  const [showPassword, setShowPassword] = React.useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const loginHref = callbackUrl
    ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : "/login";

  const {
    mutate: registerMutate,
    error: apiError,
    isPending,
    isSuccess,
  } = useRegisterMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      agree: false,
    },
  });

  const onSubmit = (data: RegisterInput) => {
    registerMutate(data);
  };

  const errorMessage = apiError
    ? getApiErrorMessage(apiError, UI_MESSAGES.auth.registerFailed)
    : null;

  return (
    <div className="w-full bg-deep-black rounded p-8 md:p-10 border border-border-dark shadow-l4 transition-all duration-300 hover:border-brand-pink/20">
      {/* Auth Tabs */}
      <div className="flex mb-8 bg-brand-dark/50 rounded-lg p-1 border border-border-dark">
        <Link
          href={loginHref}
          className="flex-grow py-2 text-center text-[14px] font-bold rounded-md text-muted-text hover:text-cream transition-colors cursor-pointer"
        >
          Đăng nhập
        </Link>
        <button className="flex-grow py-2 text-center text-[14px] font-bold rounded-md bg-brand-pink text-brand-dark transition-all">
          Đăng ký
        </button>
      </div>

      {/* Success/Error Message Container */}
      {(isSuccess || errorMessage) && (
        <div className="mb-6">
          {isSuccess && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-[13px] leading-relaxed">
              Đăng ký thành công! Đang đăng nhập tự động...
            </div>
          )}
          {errorMessage && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-[13px] leading-relaxed">
              {errorMessage}
            </div>
          )}
        </div>
      )}

      {/* Form */}
      <form className="space-y-2" onSubmit={handleSubmit(onSubmit)}>
        {/* Full Name Field */}
        <div>
          <label
            className="block text-[14px] font-bold text-cream mb-2"
            htmlFor="fullName"
          >
            Họ và tên
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-text z-10">
              <User size={18} />
            </span>
            <Input
              id="fullName"
              placeholder="Nguyễn Văn A"
              type="text"
              disabled={isPending || isSuccess}
              error={!!errors.fullName}
              className="pl-11"
              {...register("fullName")}
            />
          </div>
          <div className="h-5 mt-1.5">
            {errors.fullName && (
              <p className="text-xs text-red-500/90 font-medium">
                {errors.fullName.message}
              </p>
            )}
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label
            className="block text-[14px] font-bold text-cream mb-2"
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
              placeholder="example@hheducation.edu.vn"
              type="email"
              disabled={isPending || isSuccess}
              error={!!errors.email}
              className="pl-11"
              {...register("email")}
            />
          </div>
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
          <label
            className="block text-[14px] font-bold text-cream mb-2"
            htmlFor="password"
          >
            Mật khẩu
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-text z-10">
              <Lock size={18} />
            </span>
            <Input
              id="password"
              placeholder="••••••••"
              type={showPassword ? "text" : "password"}
              disabled={isPending || isSuccess}
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
          <div className="h-5 mt-1.5">
            {errors.password && (
              <p className="text-xs text-red-500/90 font-medium">
                {errors.password.message}
              </p>
            )}
          </div>
        </div>

        {/* Confirm Password Field */}
        <div>
          <label
            className="block text-[14px] font-bold text-cream mb-2"
            htmlFor="confirmPassword"
          >
            Xác nhận mật khẩu
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-text z-10">
              <Key size={18} />
            </span>
            <Input
              id="confirmPassword"
              placeholder="••••••••"
              type={showPassword ? "text" : "password"}
              disabled={isPending || isSuccess}
              error={!!errors.confirmPassword}
              className="pl-11"
              {...register("confirmPassword")}
            />
          </div>
          <div className="h-5 mt-1.5">
            {errors.confirmPassword && (
              <p className="text-xs text-red-500/90 font-medium">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        {/* Terms checkbox */}
        <div className="flex flex-col py-1">
          <div className="flex items-start gap-3">
            <input
              className="mt-1 w-4 h-4 rounded border-border-dark bg-off-black text-brand-pink focus:ring-brand-pink focus:ring-offset-brand-dark cursor-pointer"
              id="agree"
              type="checkbox"
              disabled={isPending || isSuccess}
              {...register("agree")}
            />
            <label
              className="text-[12px] text-muted-text select-none cursor-pointer"
              htmlFor="agree"
            >
              Tôi đồng ý với{" "}
              <a className="text-brand-pink hover:underline" href="#">
                Điều khoản dịch vụ
              </a>{" "}
              và{" "}
              <a className="text-brand-pink hover:underline" href="#">
                Chính sách bảo mật
              </a>
              .
            </label>
          </div>
          <div className="h-5 mt-1.5">
            {errors.agree && (
              <p className="text-xs text-red-500/90 font-medium">
                {errors.agree.message}
              </p>
            )}
          </div>
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          isLoading={isPending}
          disabled={isSuccess}
        >
          {isPending ? "Đang tạo tài khoản..." : "Đăng ký ngay"}
          {!isPending && !isSuccess && (
            <ArrowRight size={16} className="ml-2" />
          )}
        </Button>
      </form>

      <RegisterSocialButtons />

      {/* Switch Text */}
      <div className="mt-8 text-center">
        <p className="text-[13px] text-muted-text">
          Đã có tài khoản?
          <Link
            href={loginHref}
            className="text-brand-pink font-bold hover:underline ml-1 cursor-pointer"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
