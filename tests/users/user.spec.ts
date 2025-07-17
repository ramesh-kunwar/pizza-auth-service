import { DataSource } from "typeorm";
import request from "supertest";
import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import createJWKSMock from "mock-jwks";
import { User } from "../../src/entity/User";
import { ROLSE } from "../../src/constants";

describe("POST /auth/self", () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;

    beforeAll(async () => {
        jwks = createJWKSMock("http://localhost:4000");
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        jwks.start();
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterEach(() => {
        jwks.stop();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    describe("Given all fields", () => {
        it("should return 200 status code.", async () => {
            const accessToken = jwks.token({
                sub: "1",
                role: ROLSE.CUSTOMER,
            });

            //
            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken}`])
                .send();
            expect(response.statusCode).toBe(200);

            expect(response.statusCode).toBe(200);
        });

        it("should return the user data", async () => {
            // Register User First
            const userData = {
                firstName: "Ramesh",
                lastName: "Kunwar",
                email: "ramesh@gmail.com",
                password: "secret",
            };
            const userRepository = connection.getRepository(User);

            const data = await userRepository.save({
                ...userData,
                role: ROLSE.CUSTOMER,
            });

            // generate token
            const accessToken = jwks.token({
                sub: String(data.id),
                role: data.role,
            });

            // add token to cookie
            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send();
            // Assert

            expect((response.body as Record<string, string>).id).toBe(data.id);

            // check if user id matches with registered user.
        });

        it("should not return the password field", async () => {
            // Register User First
            const userData = {
                firstName: "Ramesh",
                lastName: "Kunwar",
                email: "ramesh@gmail.com",
                password: "secret",
            };
            const userRepository = connection.getRepository(User);

            const data = await userRepository.save({
                ...userData,
                role: ROLSE.CUSTOMER,
            });

            // generate token
            const accessToken = jwks.token({
                sub: String(data.id),
                role: data.role,
            });

            // add token to cookie
            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send();
            // Assert

            expect(response.body as Record<string, string>).not.toHaveProperty(
                "password",
            );

            // check if user id matches with registered user.
        });

        it("should return 401 status code if token doesn't exist.", async () => {
            // Register User First
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

            const response = await request(app).get("/auth/self").send();
            // Assert

            expect(response.statusCode).toBe(401);
        });
    });
});
