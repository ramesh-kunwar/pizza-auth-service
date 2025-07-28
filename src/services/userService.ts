import { Repository } from "typeorm";

import { User } from "../entity/User";
import { LimitedUserData, UserData, UserQueryParams } from "../types";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";

export class UserService {
    constructor(private userRepository: Repository<User>) {}
    async create({
        firstName,
        lastName,
        email,
        password,
        role,
        tenantId,
    }: UserData) {
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
                role,
                tenant: tenantId ? { id: tenantId } : undefined,
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

    async findByEmailWithPassword(email: string) {
        const user = this.userRepository.findOne({
            where: {
                email,
            },
            select: [
                "id",
                "firstName",
                "lastName",
                "email",
                "role",
                "password",
            ],
        });
        return user;
    }

    async findById(id: number) {
        return await this.userRepository.findOne({
            where: {
                id: id,
            },
            relations: {
                tenant: true,
            },
        });
    }

    async getAll(validatedQuery: UserQueryParams) {
        const queryBuilder = this.userRepository.createQueryBuilder();
        const result = await queryBuilder
            .skip((validatedQuery.currentPage - 1) * validatedQuery.perPage)
            .take(validatedQuery.perPage)
            .getManyAndCount();

        return result;
        // return await this.userRepository.find();
    }

    async update(
        userId: number,
        { firstName, lastName, role }: LimitedUserData,
    ) {
        try {
            return await this.userRepository.update(userId, {
                firstName,
                lastName,
                role,
            });
        } catch (error) {
            const err = createHttpError(500, "Failed to update the user in db");
            throw err;
        }
    }

    async getOne(userId: number) {
        return await this.userRepository.findOne({
            where: {
                id: userId,
            },
        });
    }

    async deleteById(userId: number) {
        return await this.userRepository.delete(userId);
    }
}
