import { Request, Response } from "express";
import { loginSchema, refreshTokenSchema, registerSchema } from "./validator";
import { LoginDto, RefreshTokenDto, RegisterDto } from "./dto";
import z from "zod";
import { sendSuccess } from "~/common/http/response";
import { authService } from "./service";


type LoginValidated = z.infer<typeof loginSchema>
type RegisterValidated = z.infer<typeof registerSchema>
type RefreshTokenValidated = z.infer<typeof refreshTokenSchema>

export const loginController = async (req: Request, res: Response) => {
    const validated = req.validated as LoginValidated

    const dto : LoginDto = {
        email: validated.body.email,
        password: validated.body.password
    }
    const data = await authService.login(dto)

    sendSuccess({res, data})
}

export const registerController = async (req: Request, res: Response) => {
    const validated = req.validated as RegisterValidated

    const dto: RegisterDto = validated.body
    const data = await authService.register(dto)

    sendSuccess({res, data, status: 201})
}

export const refreshTokenController = async (req: Request, res: Response) => {
    const validated = req.validated as RefreshTokenValidated

    const dto: RefreshTokenDto = validated.body
    const data = await authService.refreshToken(dto)

    sendSuccess({res, data})
}
