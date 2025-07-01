import { Repository } from "typeorm";

import { User } from "../entity/User";
import { UserData } from "../types";
import createHttpError from "http-errors";
import { ROLSE } from "../constants";

export class UserService {
    constructor(private userRepository: Repository<User>) {}
    async create({ firstName, lastName, email, password }: UserData) {
        // const userRespository = AppDataSource.getRepository(User);

        try {
            const user = await this.userRepository.save({
                firstName,
                lastName,
                email,
                password,
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
}
