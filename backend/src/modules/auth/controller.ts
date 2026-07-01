import { Request, Response } from 'express'
import { loginSchema, refreshTokenSchema, registerSchema } from './validator'
import { LoginDto, RefreshTokenDto, RegisterDto } from './dto'
import z from 'zod'
import { sendSuccess } from '~/common/http/response'
import type { AuthService } from './service'
import { authService } from './wiring'

type LoginValidated = z.infer<typeof loginSchema>
type RegisterValidated = z.infer<typeof registerSchema>
type RefreshTokenValidated = z.infer<typeof refreshTokenSchema>

export class AuthController {
  constructor(private readonly service: AuthService) {}

  login = async (req: Request, res: Response) => {
    const validated = req.validated as LoginValidated

    const dto: LoginDto = validated.body
    const data = await this.service.login(dto)

    sendSuccess({ res, data })
  }

  register = async (req: Request, res: Response) => {
    const validated = req.validated as RegisterValidated

    const dto: RegisterDto = validated.body
    const data = await this.service.register(dto)

    sendSuccess({ res, data, status: 201 })
  }

  refreshToken = async (req: Request, res: Response) => {
    const validated = req.validated as RefreshTokenValidated

    const dto: RefreshTokenDto = validated.body
    const data = await this.service.refreshToken(dto)

    sendSuccess({ res, data })
  }
}

export const authController = new AuthController(authService)

export const loginController = authController.login
export const registerController = authController.register
export const refreshTokenController = authController.refreshToken
