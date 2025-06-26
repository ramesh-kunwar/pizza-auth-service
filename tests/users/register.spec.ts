import request from "supertest";
import app from "../../src/app";
describe("POST /auth/register", () => {
    describe("Given All Fields", () => {
        it("should return 201 status code", async () => {
            // AAA to write test
            // 1. Arrange
            const userData = {
                firstName: "Ramesh",
                lastName: "Kunwar",
                email: "ramesh@gmail.com",
                password: "secret",
            };
            // 2. Act - main task that we need to do
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // 3. Assert
            expect(response.statusCode).toBe(201);
        });

        it("should return valid json response", async () => {
            // AAA to write test
            // 1. Arrange
            const userData = {
                firstName: "Ramesh",
                lastName: "Kunwar",
                email: "ramesh@gmail.com",
                password: "secret",
            };
            // 2. Act - main task that we need to do
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // 3. Assert application/json
            expect(response.headers["content-type"]).toEqual(
                expect.stringContaining("json"),
            );
        });

        it("should persist the user in db", async () => {
            // 1. Arrange
            const userData = {
                firstName: "Ramesh",
                lastName: "Kunwar",
                email: "ramesh@gmail.com",
                password: "secret",
            };
            // 2. Act - main task that we need to do
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // 3. Assert
            expect(response.statusCode).toBe(201);
        });
    });
    describe("Fields Are Missing", () => {});
});
