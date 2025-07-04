import winston from "winston";
import { CONFIG } from ".";

const logger = winston.createLogger({
    level: "info",

    defaultMeta: { serviceName: "auth-service" },
    transports: [
        new winston.transports.File({
            level: "info",
            dirname: "logs",
            filename: "combinded.log",
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
            ),
            silent: CONFIG.NODE_ENV === "test",
        }),
        new winston.transports.File({
            level: "error",
            dirname: "logs",
            filename: "error.log",
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
            ),

            silent: CONFIG.NODE_ENV === "test",
        }),

        new winston.transports.Console({
            level: "info",
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
            ),
            silent: CONFIG.NODE_ENV === "test",
        }),
    ],
});

export default logger;
