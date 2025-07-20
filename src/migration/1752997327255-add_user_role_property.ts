import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserRoleProperty1752997327255 implements MigrationInterface {
    name = "AddUserRoleProperty1752997327255";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "users" ADD "role" character varying NOT NULL DEFAULT 'customer'`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
    }
}
