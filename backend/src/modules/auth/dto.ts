import z from "zod";
import { loginBodySchema } from "./validator";

export type LoginDto = z.infer<typeof loginBodySchema>

export type LoginResponseDto = {
    accessToken: string,
    user: {
        id: string,
        email: string,
        fullName: string,
        role: "admin" | "teacher" | "student",
        status: "active" | "pending_verification" | "banned"
    }
}
