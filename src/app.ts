import express from "express";

const app = express();

app.get("/ping", (req, res) => {
    res.json({
        msg: "Pong",
    });
});

export default app;
