import { Router } from "express";
import { asyncHandler } from "~/common/middlewares/async-handler";
import { requireAuth } from "~/common/middlewares/require-auth";
import { getMeController } from "./controller";


export const userRoutes = Router();

userRoutes.get("/me", requireAuth, asyncHandler(getMeController))