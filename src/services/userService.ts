import { Repository } from "typeorm";

import { User } from "../entity/User";
import { UserData } from "../types";
import createHttpError from "http-errors";
import { ROLSE } from "../constants";
import bcrypt from "bcrypt";

export class UserService {
    constructor(private userRepository: Repository<User>) {}
    async create({ firstName, lastName, email, password }: UserData) {
        const user = await this.userRepository.findOne({
            where: { email: email },
        });

        if (user) {
            const err = createHttpError(400, "Email already exists.");
            throw err;
        }
        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        try {
            const user = await this.userRepository.save({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role: ROLSE.CUSTOMER,
            });
            return user;
        } catch (err) {
            const error = createHttpError(
                500,
                `Failed To Store The Data In DB. ${err}`,
            );
            throw error;
        }
    }

    async findByEmail(email: string) {
        const user = this.userRepository.findOne({
            where: {
                email,
            },
        });
        return user;
    }
}
