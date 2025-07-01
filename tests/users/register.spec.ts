import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entity/User";
import { ROLSE } from "../../src/constants";

describe("POST /auth/register", () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        // Database truncate
        // await truncateTables(connection);
        await connection.dropDatabase();

        await connection.synchronize();
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

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(users).toHaveLength(1);

            expect(users[0].firstName).toBe(userData.firstName);
            expect(users[0].lastName).toBe(userData.lastName);
            expect(users[0].email).toBe(userData.email);
        });

        it("should return an id of the created user", async () => {
            // Arrange
            const userData = {
                firstName: "Ramesh",
                lastName: "Kunwar",
                email: "ramesh@gmail.com",
                password: "secret",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert
            expect(response.body).toHaveProperty("id");
            const repository = connection.getRepository(User);
            const users = await repository.find();
            expect((response.body as Record<string, string>).id).toBe(
                users[0].id,
            );
        });

        it("should should assign a customer role ", async () => {
            // 1. Arrange
            const userData = {
                firstName: "Ramesh",
                lastName: "Kunwar",
                email: "ramesh@gmail.com",
                password: "secret",
            };
            // 2. Act
            await request(app).post("/auth/register").send(userData);
            // 3. Assert
            const repository = connection.getRepository(User);
            const users = await repository.find();
            expect(users[0]).toHaveProperty("role");
            expect(users[0].role).toBe(ROLSE.CUSTOMER);
        });

        it("should store hashed password in the database", async () => {
            // 1. Arrange
            const userData = {
                firstName: "Ramesh",
                lastName: "Kunwar",
                email: "ramesh@gmail.com",
                password: "secret",
            };
            // 2. Act
            await request(app).post("/auth/register").send(userData);
            // 3. Assert
            const repository = connection.getRepository(User);
            const users = await repository.find();
            expect(users[0]).toHaveProperty("password");
            expect(users[0].password).not.toBe(userData.password);
            expect(users[0].password).toHaveLength(60);
            expect(users[0].password).toMatch(/^\$2b\$\d+\$/);
        });

        it("should return 400 status code if the email is already in use", async () => {
            // 1. Arrange
            const userData = {
                firstName: "Ramesh",
                lastName: "Kunwar",
                email: "ramesh@gmail.com",
                password: "secret",
            };
            const userRepository = connection.getRepository(User);
            await userRepository.save({
                ...userData,
                role: ROLSE.CUSTOMER,
            });

            // 2. Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            const users = await userRepository.find();
            //3.  Assert
            expect(response.status).toBe(400);
            expect(users).toHaveLength(1);
        });
    });
    describe("Fields Are Missing", () => {});
});
