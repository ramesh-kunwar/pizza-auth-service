// import { describe } from "node:test";

import app from "./src/app";
import { calculateDiscount } from "./src/utils";
import request from "supertest";

describe.skip("App", () => {
    it("should return correct discount amount", () => {
        //
        const discount = calculateDiscount(10000, 10);

        expect(discount).toBe(1000);
    });

    it("should return 200 status code", async () => {
        const response = request(app).get("/").send();
        expect((await response).statusCode).toBe(200);
    });
});
