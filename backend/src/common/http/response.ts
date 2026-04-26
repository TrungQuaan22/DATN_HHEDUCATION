
import { Response } from "express"
export const sendSuccess = <T>({res, data, status = 200}: {res: Response, data: T, status?: number}) => {
    return res.status(status).json({
        success: true,
        data
    })
}