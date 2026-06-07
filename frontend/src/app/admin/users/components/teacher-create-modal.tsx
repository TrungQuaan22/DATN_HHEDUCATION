"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, AlertCircle, ArrowRight } from "lucide-react";
import { createTeacherAccount } from "@/features/users/api";
import { CreateTeacherRequest } from "@/features/users/types";
import { getApiErrorMessage } from "@/lib/constants/messages";
import { toast } from "@/stores/toast-store";
import {
  teacherCreateSchema,
  TeacherCreateFormInput,
  TeacherCreateInput,
} from "@/features/users/validation";

type TeacherCreateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function TeacherCreateModal({
  isOpen,
  onClose,
  onSuccess,
}: TeacherCreateModalProps) {
  const [generalError, setGeneralError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TeacherCreateFormInput, unknown, TeacherCreateInput>({
    resolver: zodResolver(teacherCreateSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: createTeacherAccount,
    onSuccess: () => {
      toast.success("Tạo tài khoản giảng viên thành công!");
      onSuccess();
      handleClose();
    },
    onError: (err: unknown) => {
      console.error("Error creating teacher account:", err);
      const errMsg = getApiErrorMessage(
        err,
        "Tạo tài khoản giảng viên thất bại."
      );
      setGeneralError(errMsg);
      toast.error(errMsg);
    },
  });

  const isSaving = createMutation.isPending;

  useEffect(() => {
    if (isOpen) {
      setGeneralError(null);
      reset();
    }
  }, [isOpen, reset]);

  if (!isOpen) return null;

  const onFormSubmit = async (data: TeacherCreateInput) => {
    setGeneralError(null);

    const payload: CreateTeacherRequest = {
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      avatarMediaId: null, // Bypassed for creation, teacher can update profile later
    };

    createMutation.mutate(payload);
  };

  const handleClose = () => {
    reset();
    setGeneralError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-admin-deep/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-admin-deep w-full max-w-lg rounded shadow-2xl border border-admin-border/30 relative flex flex-col my-auto max-h-[90vh] overflow-hidden text-admin-cream animate-in fade-in zoom-in duration-200">
        <button
          onClick={handleClose}
          disabled={isSaving}
          className="absolute top-6 right-6 text-admin-muted hover:text-admin-cream transition-colors disabled:opacity-40 disabled:pointer-events-none"
          type="button"
        >
          <X size={20} />
        </button>

        <div className="px-8 pt-8 pb-6 text-center border-b border-admin-border/20 bg-admin-surface-low/30">
          <h3 className="text-2xl font-bold font-serif text-admin-cream flex items-center justify-center gap-2">
            Tạo Giảng Viên Mới
          </h3>
          <p className="text-sm text-admin-muted mt-2 max-w-sm mx-auto">
            Hệ thống sẽ tạo tài khoản hoạt động ngay cho giảng viên mà không cần
            xác minh email.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className="flex-grow overflow-y-auto px-8 py-6 space-y-4 custom-scrollbar"
        >
          {generalError && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{generalError}</span>
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-admin-muted block uppercase tracking-wider">
              Họ và tên giảng viên <span className="text-admin-pink">*</span>
            </label>
            <input
              type="text"
              {...register("fullName")}
              placeholder="Ví dụ: Nguyễn Văn Thầy"
              className={`w-full bg-admin-surface-low border focus:outline-none focus:ring-1 rounded px-4 py-2.5 text-admin-cream placeholder:text-admin-muted/40 transition-all font-medium text-[14px] ${
                errors.fullName
                  ? "border-red-500/50 focus:border-red-500 focus:ring-red-500"
                  : "border-admin-border/30 focus:border-admin-pink focus:ring-admin-pink"
              }`}
            />
            {errors.fullName && (
              <p className="text-red-400 text-xs mt-1">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-admin-muted block uppercase tracking-wider">
              Địa chỉ Email <span className="text-admin-pink">*</span>
            </label>
            <input
              type="email"
              {...register("email")}
              placeholder="email@example.com"
              className={`w-full bg-admin-surface-low border focus:outline-none focus:ring-1 rounded px-4 py-2.5 text-admin-cream placeholder:text-admin-muted/40 transition-all font-medium text-[14px] ${
                errors.email
                  ? "border-red-500/50 focus:border-red-500 focus:ring-red-500"
                  : "border-admin-border/30 focus:border-admin-pink focus:ring-admin-pink"
              }`}
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-admin-muted block uppercase tracking-wider">
              Mật khẩu <span className="text-admin-pink">*</span>
            </label>
            <input
              type="password"
              {...register("password")}
              placeholder="••••••••"
              className={`w-full bg-admin-surface-low border focus:outline-none focus:ring-1 rounded px-4 py-2.5 text-admin-cream placeholder:text-admin-muted/40 transition-all font-medium text-[14px] ${
                errors.password
                  ? "border-red-500/50 focus:border-red-500 focus:ring-red-500"
                  : "border-admin-border/30 focus:border-admin-pink focus:ring-admin-pink"
              }`}
            />
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-admin-muted block uppercase tracking-wider">
              Xác nhận mật khẩu <span className="text-admin-pink">*</span>
            </label>
            <input
              type="password"
              {...register("confirmPassword")}
              placeholder="••••••••"
              className={`w-full bg-admin-surface-low border focus:outline-none focus:ring-1 rounded px-4 py-2.5 text-admin-cream placeholder:text-admin-muted/40 transition-all font-medium text-[14px] ${
                errors.confirmPassword
                  ? "border-red-500/50 focus:border-red-500 focus:ring-red-500"
                  : "border-admin-border/30 focus:border-admin-pink focus:ring-admin-pink"
              }`}
            />
            {errors.confirmPassword && (
              <p className="text-red-400 text-xs mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </form>

        <div className="px-8 py-5 border-t border-admin-border/20 bg-admin-surface-low/30 flex items-center justify-between rounded-b-2xl">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSaving}
            className="px-6 py-2.5 text-sm font-bold text-admin-muted hover:text-admin-cream transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
          >
            Hủy
          </button>

          <button
            type="submit"
            onClick={handleSubmit(onFormSubmit)}
            disabled={isSaving}
            className="bg-admin-pink text-white px-6 py-2.5 text-sm font-bold rounded shadow-lg shadow-admin-pink/20 hover:brightness-110 transition-all flex items-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? "Đang lưu..." : "Tạo tài khoản"}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
