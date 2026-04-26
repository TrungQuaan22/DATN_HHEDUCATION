import { Request, Response } from "express";
import { loginSchema } from "./validator";
import { LoginDto } from "./dto";
import z from "zod";
import { sendSuccess } from "~/common/http/response";


type LoginValidated = z.infer<typeof loginSchema>
export const loginController = async (req: Request, res: Response) => {
    const validated = req.validated as LoginValidated

    const dto : LoginDto = {
        email: validated.body.email,
        password: validated.body.password
    }
    // Handle login logic here, e.g. check credentials, generate token, etc.
    sendSuccess({res , data: {
        message: 'Login successful',
        dto
    }})
}