import * as z from "zod";

export const teacherCreateSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Họ và tên giảng viên phải từ 2 ký tự trở lên")
      .max(100, "Họ và tên giảng viên không quá 100 ký tự"),
    email: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập email")
      .email("Định dạng email không hợp lệ"),
    password: z
      .string()
      .min(8, "Mật khẩu phải từ 8 ký tự trở lên")
      .max(64, "Mật khẩu không quá 64 ký tự")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 chữ số và 1 ký tự đặc biệt (@$!%*?&)"
      ),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
    avatarMediaId: z.string().nullable().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Xác nhận mật khẩu không khớp",
    path: ["confirmPassword"],
  });

export type TeacherCreateFormInput = z.input<typeof teacherCreateSchema>;
export type TeacherCreateInput = z.output<typeof teacherCreateSchema>;
