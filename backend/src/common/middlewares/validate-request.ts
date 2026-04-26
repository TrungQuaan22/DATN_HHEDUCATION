import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";
import { ERROR_CODE } from "../constant/error-code";
import { AppError } from "../error/app-error";

export const validateRequest = (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params
    })
    if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
            location: issue.path[0],
            field: issue.path.slice(1).join('.'),
            message: issue.message
        }))
        return next(
            new AppError(400, ERROR_CODE.BAD_REQUEST, 'Validation failed', errors)
        )
    }
    req.validated = result.data
    next()
}