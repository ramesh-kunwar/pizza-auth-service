import "reflect-metadata";
import path from "path";

import express, { NextFunction, Request, Response } from "express";
import logger from "./config/logger";
import { HttpError } from "http-errors";
import authRouter from "./routes/auth";
import tenantRouter from "./routes/tenant";
import userRouter from "./routes/user";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser());
// app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "../public")));

// JWKS endpoint - only in production/development, not in test
if (process.env.NODE_ENV !== "test") {
    app.get("/.well-known/jwks.json", (req, res) => {
        const jwks = {
            keys: [
                {
                    kty: "RSA",
                    use: "sig",
                    n: "AMgLOeLV2499jtFfEYNHBbJFN0VdI-Kc92N77ofnWuvSZv7VapZZhZ_fnUjb1vs2iP4ibm0SVrQCVp5ywK8r9M380N_YtdQMNVoIvTqki5Mi_p3MWLEDSdSiYjlPeW5AYqOT3n-g2G2EnfgS2nzCtvTBeKWtZWt86jNGme6D8RZ9EUTAScP6_47xvfYrSp3uhz8cB2Befy3encFfcxMZEu8qo4jLXCfyoC2J0Qr00cyyFa7wkOfalQMTgphokJOurUn2tR9lnm6cnm725KXQLnm610iWNXm8_269ENxZFLH539egOSsfFret3ccw33egSD7zNf2YRFHkdP_j9uIRrJE",
                    e: "AQAB",
                },
            ],
        };
        res.json(jwks);
    });
}

app.get("/", async (req, res) => {
    res.json({
        msg: " Wecome From Auth Service ",
    });
});

app.use("/auth", authRouter);
app.use("/tenants", tenantRouter);
app.use("/users", userRouter);
// global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message);
    const statusCode = err.statusCode || err.status || 500;

    res.status(statusCode).json({
        errors: [
            {
                type: err.name,
                msg: err.message,
                path: "",
                location: "",
            },
        ],
    });
});

export default app;
