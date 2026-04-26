/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response ,NextFunction } from "express"
import { AppError } from "./app-error"
import { ERROR_CODE } from "../constant/error-code"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const errorHandler = (err : any, req : Request, res : Response, next : NextFunction) => {
    if (err instanceof AppError) {
        return res.status(err.status).json({
            success: false,
            error: {
                code: err.code,
                message: err.message,
                details: err.details
            }
        })
    }
    console.error({requestId: req.requestId, error: err})
    return res.status(500).json({
        success: false,
        error: {
            code: ERROR_CODE.INTERNAL_SERVER_ERROR,
            message: 'An internal server error occurred.',
            details: null
        }
    })
}