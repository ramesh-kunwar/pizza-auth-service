import { DataSource } from "typeorm";
import request from "supertest";
import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import createJWKSMock from "mock-jwks";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";
import { Tenant } from "../../src/entity/Tenant";

describe("POST /users", () => {
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
        it("should persist the user in db. ", async () => {
            const adminToken = jwks.token({
                sub: "1",
                role: Roles.ADMIN,
            });

            const tenantRepository = connection.getRepository(Tenant);
            const tenant = await tenantRepository.save({
                name: "Test tenant",
                address: "Test address",
            });

            const userData = {
                firstName: "Ramesh",
                lastName: "Kunwar",
                email: "ramesh@gmail.com",
                password: "secret",
                tenantId: tenant.id,
                role: Roles.MANAGER,
            };

            const userRepository = connection.getRepository(User);
            const data = await userRepository.save({
                ...userData,
                role: Roles.MANAGER,
            });

            // generate token
            await request(app)
                .post("/users")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(data);
            // Assert

            const users = await userRepository.find();

            expect(users).toHaveLength(1);

            expect(users[0].email).toBe(data.email);
        });

        it("should create a manager user", async () => {
            const adminToken = jwks.token({
                sub: "1",
                role: Roles.ADMIN,
            });
            const tenantRepository = connection.getRepository(Tenant);
            const tenant = await tenantRepository.save({
                name: "Test tenant",
                address: "Test address",
            });
            const userData = {
                firstName: "Ramesh",
                lastName: "Kunwar",
                email: "ramesh@gmail.com",
                password: "secret",
                tenantId: tenant.id,
                role: Roles.MANAGER,
            };

            const userRepository = connection.getRepository(User);

            const data = await userRepository.save({
                ...userData,
                role: Roles.MANAGER,
            });

            // generate token
            await request(app)
                .post("/users")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(data);

            const users = await userRepository.find();

            // Assert
            expect(users).toHaveLength(1);

            expect(users[0].role).toBe(Roles.MANAGER);
        });
    });
});
