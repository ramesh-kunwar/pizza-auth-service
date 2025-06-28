import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { truncateTables } from "../utils";
import { User } from "../../src/entity/User";

describe("POST /auth/register", () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        // Database truncate
        await truncateTables(connection);
    });

    afterAll(async () => {
        await connection.destroy();
    });

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
            await request(app).post("/auth/register").send(userData);

            // 3. Assert

            // 4.
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(users).toHaveLength(1);

            expect(users[0].firstName).toBe(userData.firstName);
            expect(users[0].lastName).toBe(userData.lastName);
            expect(users[0].email).toBe(userData.email);
        });
    });
    describe("Fields Are Missing", () => {});
});
