import { Response, NextFunction, Request } from "express";
import { UserService } from "../services/userService";
import { CreateUserRequest } from "../types";
import { Roles } from "../constants";
import { Logger } from "winston";
import createHttpError from "http-errors";

export class UserController {
    constructor(
        private userService: UserService,
        private logger: Logger,
    ) {}

    async create(req: CreateUserRequest, res: Response, next: NextFunction) {
        const { firstName, lastName, email, password } = req.body;
        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
                role: Roles.MANAGER,
            });
            res.status(201).json({ id: user.id });
        } catch (error) {
            next(error);
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await this.userService.getAll();

            this.logger.info("All users have been fetched");
            res.json(users);
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        const { firstName, lastName, role } = req.body;

        const userId = req.params.id;

        if (isNaN(Number(userId))) {
            next(createHttpError(400, "Invalid user params"));
            return;
        }

        this.logger.debug("Request for updating a user", req.body);

        try {
            await this.userService.update(Number(userId), {
                firstName,
                lastName,
                role,
            });
        } catch (error) {
            next(error);
        }
    }

    async getOne(req: Request, res: Response, next: NextFunction) {
        const userId = req.params.id;

        if (isNaN(Number(userId))) {
            next(createHttpError(400, "Invalid user params"));
            return;
        }

        this.logger.info("Error while fetching user.", { id: userId });

        try {
            const user = await this.userService.getOne(Number(userId));

            res.json(user);
        } catch (error) {
            next(error);
        }
    }

    async deleteById(req: Request, res: Response, next: NextFunction) {
        const userId = req.params.id;

        if (isNaN(Number(userId))) {
            next(createHttpError(400, "Invalid user params"));
            return;
        }

        this.logger.info("Error while fetching user.", { id: userId });

        try {
            await this.userService.deleteById(Number(userId));
        } catch (error) {
            next(error);
        }
    }
}
