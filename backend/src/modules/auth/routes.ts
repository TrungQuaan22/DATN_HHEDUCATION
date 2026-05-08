import { Router } from "express";
import { validateRequest } from "~/common/middlewares/validate-request";
import { loginSchema, refreshTokenSchema, registerSchema } from "./validator";
import { asyncHandler } from "~/common/middlewares/async-handler";
import { loginController, refreshTokenController, registerController } from "./controller";

export const authRoutes = Router()
authRoutes.post('/register', validateRequest(registerSchema), asyncHandler(registerController))
authRoutes.post('/login', validateRequest(loginSchema), asyncHandler(loginController))
authRoutes.post('/refresh-token', validateRequest(refreshTokenSchema), asyncHandler(refreshTokenController))