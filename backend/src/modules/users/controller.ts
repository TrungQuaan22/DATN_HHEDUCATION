import { sendSuccess } from "~/common/http/response";
import { Request, Response } from "express";
import { userService } from "./service";

export const getMeController = async (req: Request, res: Response) => {
    const { id } = req.user!;
    const data = await userService.getMe(id);

    sendSuccess({ res, data });
}
