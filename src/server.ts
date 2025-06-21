import app from "./app";
import { CONFIG } from "./config";

const startServer = () => {
    try {
        app.listen(CONFIG.PORT, () =>
            console.log(`Server is listening at port: ${CONFIG.PORT}`),
        );
    } catch (error) {
        console.log(error);
    }
};

startServer();
