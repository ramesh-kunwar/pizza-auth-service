import { Request, Response } from "express";

export class AuthController {
    reigister(req: Request, res: Response) {
        res.status(201).json();
    }
}
