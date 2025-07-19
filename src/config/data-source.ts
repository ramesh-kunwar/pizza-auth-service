import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entity/User";
import { CONFIG } from ".";
import { RefreshToken } from "../entity/RefreshToken";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: CONFIG.DB_HOST,
    port: Number(CONFIG.DB_PORT),
    username: CONFIG.DB_USERNAME,
    password: CONFIG.DB_PASSWORD,
    database: CONFIG.DB_NAME,

    // synchronize: false, // Don't use this in production always use false
    synchronize: false, // Don't use this in production always use false
    // synchronize: CONFIG.NODE_ENV === "test" || CONFIG.NODE_ENV === "dev", // don't use this in production

    logging: false,
    entities: [User, RefreshToken],
    migrations: ["src/migration/*.ts"],
    subscribers: [],
});
