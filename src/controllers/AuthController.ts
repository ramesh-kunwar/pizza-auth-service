import { NextFunction, Response } from "express";
import { UserService } from "../services/userService";
import { AuthRequest, RegisterUserRequest } from "../types";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { JwtPayload } from "jsonwebtoken";
import { TokenService } from "../services/tokenService";
import createHttpError from "http-errors";
import { CredentialService } from "../services/CredentialService";

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
        private tokenService: TokenService,
        private credentialService: CredentialService,
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
            return;
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

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            // persist the refresh token
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });
            res.cookie("accessToken", accessToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60, // 1h
                httpOnly: true,
            });
            res.cookie("refreshToken", refreshToken, {
                domain: "localhost",
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
    async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
        // validation
        const result = validationResult(req);

        if (!result.isEmpty()) {
            res.status(400).json({ errors: result.array() });
            return;
        }

        const { email, password } = req.body;

        this.logger.debug("New request to login a user", {
            email,
            password: "******",
        });

        try {
            // check if user email exist in db.

            const user = await this.userService.findByEmail(email);
            if (!user) {
                const error = createHttpError(
                    400,
                    "Email or password does not match.",
                );
                next(error);
                return;
            }

            // compare password

            const passwordMatch = await this.credentialService.comparePassword(
                password,
                user.password,
            );

            if (!passwordMatch) {
                const error = createHttpError(
                    400,
                    "Email or password doesn't match",
                );
                next(error);
                return;
            }

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            // persist the refresh token
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });
            res.cookie("accessToken", accessToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60, // 1h
                httpOnly: true,
            });
            res.cookie("refreshToken", refreshToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1year
                httpOnly: true,
            });

            this.logger.info("Usere Has Been Logged In", { id: user.id });
            res.status(200).json({
                id: user.id,
            });
        } catch (error) {
            next(error);
            return;
        }
    }

    async self(req: AuthRequest, res: Response) {
        const user = await this.userService.findById(Number(req.auth.sub));

        // user?.password = null;
        res.status(200).json({
            ...user,
            password: undefined,
        });
    }

    async refresh(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const payload: JwtPayload = {
                sub: req.auth.sub,
                role: req.auth.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);
            const user = await this.userService.findById(Number(req.auth.sub));
            if (!user) {
                const error = createHttpError(
                    401,
                    "User with the toke could not find.",
                );
                next(error);
                return;
            }
            // Persist the refresh token
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            // Delete old refresh token
            await this.tokenService.deleteRefreshToken(Number(req.auth.id));

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });
            res.cookie("accessToken", accessToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60, // 1h
                httpOnly: true,
            });
            res.cookie("refreshToken", refreshToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1year
                httpOnly: true,
            });
        } catch (error) {
            next(error);
            return;
        }
    }

    async logout(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            await this.tokenService.deleteRefreshToken(Number(req.auth.id));

            this.logger.info("Refresh Token has been deleted", req.auth.id);

            this.logger.info("User has been logged out.", req.auth.sub);

            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");

            res.json({});
        } catch (error) {
            next(error);
            return;
        }
    }
}
