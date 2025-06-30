import { Response } from "express";
import { UserService } from "../services/userService";
import { RegisterUserRequest } from "../types";

export class AuthController {
    constructor(private userService: UserService) {}
    register(req: RegisterUserRequest, res: Response) {
        const { firstName, lastName, email, password } = req.body;

        this.userService.create({ firstName, lastName, email, password });

        res.status(201).json();
    }
}
