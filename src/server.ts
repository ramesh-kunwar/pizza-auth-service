import "reflect-metadata";

import app from "./app";
import { CONFIG } from "./config";
import { AppDataSource } from "./config/data-source";
import logger from "./config/logger";

const startServer = async () => {
    try {
        await AppDataSource.initialize();
        app.listen(CONFIG.PORT, () => {
            console.log("Database connected successfully");
            logger.info(`Server is listening at port: ${CONFIG.PORT}`);
        });
    } catch (error) {
        logger.info(error);
    }
};

startServer();
