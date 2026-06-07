import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi } from "./api";
import { useAuthStore } from "@/stores/auth-store";

// ==========================================
// Zod Validation Schemas (Synced with Backend + User Requests)
// ==========================================

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email không được để trống")
    .email("Email không đúng định dạng"),
  password: z
    .string()
    .trim()
    .min(8, "Mật khẩu phải có tối thiểu 8 ký tự")
    .max(64, "Mật khẩu không được vượt quá 64 ký tự")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/,
      "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 chữ số và 1 ký tự đặc biệt",
    ),
  remember: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Họ và tên phải có tối thiểu 2 ký tự")
      .max(100, "Họ và tên không được vượt quá 100 ký tự"),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, "Email không được để trống")
      .email("Email không đúng định dạng"),
    password: z
      .string()
      .trim()
      .min(8, "Mật khẩu phải có tối thiểu 8 ký tự")
      .max(64, "Mật khẩu không được vượt quá 64 ký tự")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/,
        "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 chữ số và 1 ký tự đặc biệt",
      ),
    confirmPassword: z
      .string()
      .trim()
      .min(8, "Xác nhận mật khẩu phải có tối thiểu 8 ký tự")
      .max(64, "Xác nhận mật khẩu không được vượt quá 64 ký tự"),
    agree: z.boolean().refine((val) => val === true, {
      message: "Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách bảo mật",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Xác nhận mật khẩu không trùng khớp",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

// ==========================================
// Custom Query & Mutation Hooks
// ==========================================

export function useMeQuery() {
  const accessToken = useAuthStore((state) => state.accessToken);
  return useQuery({
    queryKey: ['users', 'me'],
    queryFn: () => authApi.getMe(),
    enabled: !!accessToken,
    staleTime: Infinity, // Low frequency of changes
  });
}

export function useLoginMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setTokens = useAuthStore((state) => state.setTokens);

  return useMutation({
    mutationFn: async (data: LoginInput) => {
      return await authApi.login({
        email: data.email,
        password: data.password,
      });
    },
    onSuccess: (data) => {
      setTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        role: data.user.role,
      });
      // Ingest user details into TanStack Query Cache directly
      queryClient.setQueryData(['users', 'me'], data.user);
      
      // Navigate based on role immediately
      if (data.user.role === 'admin') {
        router.push("/admin/courses");
      } else {
        router.push("/");
      }
      router.refresh();
    },
  });
}

export function useRegisterMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setTokens = useAuthStore((state) => state.setTokens);

  return useMutation({
    mutationFn: async (data: RegisterInput) => {
      const registerData = await authApi.register({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });

      try {
        const loginData = await authApi.login({
          email: data.email,
          password: data.password,
        });
        return { registerData, loginData, autoLoginSuccess: true };
      } catch (loginErr) {
        console.error("Tự động đăng nhập thất bại sau khi đăng ký:", loginErr);
        return { registerData, loginData: null, autoLoginSuccess: false };
      }
    },
    onSuccess: (result) => {
      if (result.autoLoginSuccess && result.loginData) {
        setTokens({
          accessToken: result.loginData.accessToken,
          refreshToken: result.loginData.refreshToken,
          role: result.loginData.user.role,
        });
        queryClient.setQueryData(['users', 'me'], result.loginData.user);
        
        if (result.loginData.user.role === 'admin') {
          router.push("/admin/courses");
        } else {
          router.push("/");
        }
        router.refresh();
      } else {
        router.push("/login?registered=true");
      }
    },
  });
}
