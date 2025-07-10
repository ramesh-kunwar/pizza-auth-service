import { NextFunction, Response } from "express";
import { UserService } from "../services/userService";
import { RegisterUserRequest } from "../types";
import { Logger } from "winston";
import { validationResult } from "express-validator";

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
    ) {}

    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        // validation
        const result = validationResult(req);

        if (!result.isEmpty()) {
            res.status(400).json({ errors: result.array() });
        }

        const { firstName, lastName, email, password } = req.body;

        this.logger.debug("New request to register a user", {
            firstName,
            lastName,
            email,
            password: "******",
        });

        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
            });

            this.logger.info("User has been registered", { id: user.id });

            const accessToken = "ldasfasfas";
            const refreshToken = "ldasfasfas";

            res.cookie("accessToken", accessToken, {
                domain: "localost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60, // 1h
                httpOnly: true,
            });
            res.cookie("refreshToken", refreshToken, {
                domain: "localost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1year
                httpOnly: true,
            });

            res.status(201).json({
                id: user.id,
            });
        } catch (error) {
            next(error);
            return;
        }
    }
}
