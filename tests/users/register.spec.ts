import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entity/User";
import { ROLSE } from "../../src/constants";
import { isJwt } from "../../src/utils";
import { RefreshToken } from "../../src/entity/RefreshToken";
// import { isJwt } from "../utils/index";

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

        it("should return the access token and referesh token inside a cookie", async () => {
            // 1. Arrange
            const userData = {
                firstName: "Ramesh",
                lastName: "Kunwar",
                email: "ramesh@gmail.com",
                password: "secret",
            };

            let accessToken: string | null = null;
            let refreshToken: string | null = null;
            // interface Headers {
            //     ["set-cookie"]: string[];
            // }

            interface Headers {
                ["set-cookie"]: string[];
            }

            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // const cookies = (response.headers as Headers)["set-cookie"] || [];
            const cookies =
                (response.headers as unknown as Headers)["set-cookie"] || [];

            // accessToken=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNjkzOTA5Mjc2LCJleHAiOjE2OTM5MDkzMzYsImlzcyI6Im1lcm5zcGFjZSJ9.KetQMEzY36vxhO6WKwSR-P_feRU1yI-nJtp6RhCEZQTPlQlmVsNTP7mO-qfCdBr0gszxHi9Jd1mqf-hGhfiK8BRA_Zy2CH9xpPTBud_luqLMvfPiz3gYR24jPjDxfZJscdhE_AIL6Uv2fxCKvLba17X0WbefJSy4rtx3ZyLkbnnbelIqu5J5_7lz4aIkHjt-rb_sBaoQ0l8wE5KzyDNy7mGUf7cI_yR8D8VlO7x9llbhvCHF8ts6YSBRBt_e2Mjg5txtfBaDq5auCTXQ2lmnJtMb75t1nAFu8KwQPrDYmwtGZDkHUcpQhlP7R-y3H99YnrWpXbP8Zr_oO67hWnoCSw; Max-Age=43200; Domain=localhost; Path=/; Expires=Tue, 05 Sep 2023 22:21:16 GMT; HttpOnly; SameSite=Strict
            cookies.forEach((cookie) => {
                if (cookie.startsWith("accessToken=")) {
                    accessToken = cookie.split(";")[0].split("=")[1];
                }

                if (cookie.startsWith("refreshToken=")) {
                    refreshToken = cookie.split(";")[0].split("=")[1];
                }
            });
            expect(accessToken).not.toBeNull();
            expect(refreshToken).not.toBeNull();

            expect(isJwt(accessToken)).toBeTruthy();
            expect(isJwt(refreshToken)).toBeTruthy();
        });

        it("should store the refresh token in the database", async () => {
            // 1. Arrange
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
            const refreshTokenRepo = connection.getRepository(RefreshToken);
            // const refreshTokens = await refreshTokenRepo.find();

            const tokens = await refreshTokenRepo
                .createQueryBuilder("refreshToken")
                .where("refreshToken.userId = :userId", {
                    userId: (response.body as Record<string, string>).id,
                })
                .getMany();

            expect(tokens).toHaveLength(1);
        });
    });
    describe("Fields Are Missing", () => {
        it("should return 400 status code if email field is missing", async () => {
            // 1. Arrange
            const userData = {
                firstName: "Ramesh",
                lastName: "Kunwar",
                email: "",
                password: "secret",
            };

            // 2. Act

            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // 3. Assert
            expect(response.statusCode).toBe(400);
            // check if email is added in db or not -> it should not be added in db
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(users).toHaveLength(0);
        });

        it("should return 400 status code if firstName is missing", async () => {
            // Arrange
            const userData = {
                firstName: "",
                lastName: "Kunwar",
                email: "ramesh@gmail.com",
                password: "secret",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });

        it("should return 400 status code if lastName is missing", async () => {
            // Arrange
            const userData = {
                firstName: "Ramesh",
                lastName: "",
                email: "ramesh@gmail.com",
                password: "secret",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });
        it("should return 400 status code if password is missing", async () => {
            // Arrange
            const userData = {
                firstName: "Ramesh",
                lastName: "Kunwar",
                email: "ramesh@gmail.com",
                password: "",
            };
            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });
    });

    describe("Fields are not in proper format", () => {
        it("should trim the email field", async () => {
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
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            const user = users[1];

            expect(user.email).toBe("ramesh@gmail.com");
        });
    });
});
