import app from "./app";
import { CONFIG } from "./config";
import logger from "./config/logger";

const startServer = () => {
    try {
        app.listen(CONFIG.PORT, () => {
            logger.info(`Server is listening at port: ${CONFIG.PORT}`);
        });
    } catch (error) {
        logger.info(error);
    }
};

startServer();
