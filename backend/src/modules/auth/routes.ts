import { Router } from "express";
import { validateRequest } from "~/common/middlewares/validate-request";
import { loginSchema } from "./validator";
import { asyncHandler } from "~/common/middlewares/async-handler";
import { loginController } from "./controller";

export const authRoutes = Router()
authRoutes.post('/login', validateRequest(loginSchema), asyncHandler(loginController))