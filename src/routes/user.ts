import express from "express";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import { Roles } from "../constants";
import { UserController } from "../controllers/Usercontroller";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import { UserService } from "../services/userService";
import logger from "../config/logger";

const router = express.Router();

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);

const usercontroller = new UserController(userService, logger);

router.post(
    "/users",
    authenticate,
    canAccess([Roles.ADMIN]),

    (req, res, next) => usercontroller.create(req, res, next),
);

router.get("/users", authenticate, canAccess([Roles.ADMIN]), (req, res, next) =>
    usercontroller.getAll(req, res, next),
);

export default router;
