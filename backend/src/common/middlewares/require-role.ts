import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "@prisma/client";

import { ERROR_CODE } from "~/common/constant/error-code";
import { ERROR_MESSAGE } from "~/common/constant/error-message";
import { AppError } from "~/common/error/app-error";

export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, ERROR_CODE.UNAUTHORIZED, ERROR_MESSAGE.UNAUTHORIZED));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, ERROR_CODE.FORBIDDEN, ERROR_MESSAGE.FORBIDDEN));
    }

    return next();
  };
};
