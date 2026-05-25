'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Lock, User, Key, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterInput, useRegisterMutation } from '../hooks/queries';

export function RegisterForm() {
  const [showPassword, setShowPassword] = React.useState(false);

  const { mutate: registerMutate, error: apiError, isPending, isSuccess } = useRegisterMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      agree: false,
    },
  });

  const onSubmit = (data: RegisterInput) => {
    registerMutate(data);
  };

  const errorMessage = apiError
    ? (apiError as any).message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.'
    : null;

  return (
    <div className="w-full bg-deep-black rounded-xl p-8 md:p-10 border border-border-dark shadow-l4 transition-all duration-300 hover:border-brand-pink/20">
      {/* Auth Tabs */}
      <div className="flex mb-8 bg-brand-dark/50 rounded-lg p-1 border border-border-dark">
        <Link 
          href="/login" 
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
          <label className="block text-[14px] font-bold text-cream mb-2" htmlFor="fullName">
            Họ và tên
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-text">
              <User size={18} />
            </span>
            <input
              className="w-full bg-off-black border border-border-dark text-cream rounded-xl px-4 py-3.5 pl-11 placeholder:text-muted-text/30 focus:outline-none focus:border-brand-pink/50 focus:ring-1 focus:ring-brand-pink/50 transition-all text-[15px]"
              id="fullName"
              placeholder="Nguyễn Văn A"
              type="text"
              disabled={isPending || isSuccess}
              {...register('fullName')}
            />
          </div>
          {/* Pre-allocated height for validation error to prevent layout shifts */}
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
          <label className="block text-[14px] font-bold text-cream mb-2" htmlFor="email">
            Email
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-text">
              <Mail size={18} />
            </span>
            <input
              className="w-full bg-off-black border border-border-dark text-cream rounded-xl px-4 py-3.5 pl-11 placeholder:text-muted-text/30 focus:outline-none focus:border-brand-pink/50 focus:ring-1 focus:ring-brand-pink/50 transition-all text-[15px]"
              id="email"
              placeholder="example@hheducation.edu.vn"
              type="email"
              disabled={isPending || isSuccess}
              {...register('email')}
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
          <label className="block text-[14px] font-bold text-cream mb-2" htmlFor="password">
            Mật khẩu
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-text">
              <Lock size={18} />
            </span>
            <input
              className="w-full bg-off-black border border-border-dark text-cream rounded-xl px-4 py-3.5 pl-11 pr-12 placeholder:text-muted-text/30 focus:outline-none focus:border-brand-pink/50 focus:ring-1 focus:ring-brand-pink/50 transition-all text-[15px]"
              id="password"
              placeholder="••••••••"
              type={showPassword ? 'text' : 'password'}
              disabled={isPending || isSuccess}
              {...register('password')}
            />
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-text hover:text-brand-pink transition-colors cursor-pointer"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {/* Pre-allocated height for validation error to prevent layout shifts */}
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
          <label className="block text-[14px] font-bold text-cream mb-2" htmlFor="confirmPassword">
            Xác nhận mật khẩu
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-text">
              <Key size={18} />
            </span>
            <input
              className="w-full bg-off-black border border-border-dark text-cream rounded-xl px-4 py-3.5 pl-11 placeholder:text-muted-text/30 focus:outline-none focus:border-brand-pink/50 focus:ring-1 focus:ring-brand-pink/50 transition-all text-[15px]"
              id="confirmPassword"
              placeholder="••••••••"
              type={showPassword ? 'text' : 'password'}
              disabled={isPending || isSuccess}
              {...register('confirmPassword')}
            />
          </div>
          {/* Pre-allocated height for validation error to prevent layout shifts */}
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
              {...register('agree')}
            />
            <label className="text-[12px] text-muted-text select-none cursor-pointer" htmlFor="agree">
              Tôi đồng ý với{' '}
              <a className="text-brand-pink hover:underline" href="#">
                Điều khoản dịch vụ
              </a>{' '}
              và{' '}
              <a className="text-brand-pink hover:underline" href="#">
                Chính sách bảo mật
              </a>
              .
            </label>
          </div>
          {/* Pre-allocated height for validation error to prevent layout shifts */}
          <div className="h-5 mt-1.5">
            {errors.agree && (
              <p className="text-xs text-red-500/90 font-medium">
                {errors.agree.message}
              </p>
            )}
          </div>
        </div>

        {/* Submit button */}
        <button
          className="w-full bg-brand-pink text-brand-dark hover:opacity-95 active:scale-[0.98] font-bold text-[14px] uppercase tracking-wider py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          type="submit"
          disabled={isPending || isSuccess}
        >
          {isPending ? 'Đang tạo tài khoản...' : 'Đăng ký ngay'}
          {!isPending && !isSuccess && <ArrowRight size={16} />}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border-dark"></div>
        </div>
        <div className="relative flex justify-center text-[12px]">
          <span className="px-4 bg-deep-black text-muted-text font-bold">Hoặc đăng ký bằng</span>
        </div>
      </div>

      {/* Social Login */}
      <div className="grid grid-cols-2 gap-4">
        <button className="flex items-center justify-center gap-2.5 py-3 px-4 bg-off-black border border-border-dark rounded-xl hover:bg-brand-dark/50 transition-colors w-full cursor-pointer group">
          <img 
            alt="Google" 
            className="w-5 h-5 group-hover:scale-105 transition-transform" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtiZWFbehkPh_VjCh3BbhIqU6T4qaQGFOTmfq_lzq5JcBQYATLXdqnKovyhBldzePPeQ7AczNOnUAxlmNZOGiF0gg8h8vp-fwJvLd2np9HdxTL6LSA0Yh35hx14tmByFeZlXawBUENJXggz5KuE_KgsXwmpMcJ-PnP6NbOdJy_nHrBR_6BExVWAB7cTVxhdKOxhhr9H_CjzCYso8RfPcx3X9BYASz6r73eLhnlD0vG0FHAM8XKHf-cGZze3uk9dVHe_xgN80eYkuE" 
          />
          <span className="text-[14px] font-bold text-cream">Google</span>
        </button>
        
        <button className="flex items-center justify-center gap-2.5 py-3 px-4 bg-off-black border border-border-dark rounded-xl hover:bg-brand-dark/50 transition-colors w-full cursor-pointer group">
          <svg className="w-5 h-5 text-sky-blue group-hover:scale-105 transition-transform" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span className="text-[14px] font-bold text-cream">Facebook</span>
        </button>
      </div>

      {/* Switch Text */}
      <div className="mt-8 text-center">
        <p className="text-[13px] text-muted-text">
          Đã có tài khoản?
          <Link href="/login" className="text-brand-pink font-bold hover:underline ml-1 cursor-pointer">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
