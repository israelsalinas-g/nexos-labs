import { MigrationInterface, QueryRunner } from 'typeorm';

export class StandardizePatientColumns1697086800000 implements MigrationInterface {
    name = 'StandardizePatientColumns1697086800000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Renombrar columnas eliminando el prefijo "patient"
        await queryRunner.query(`ALTER TABLE "patients" RENAME COLUMN "patientName" TO "name"`);
        await queryRunner.query(`ALTER TABLE "patients" RENAME COLUMN "patientAge" TO "age"`);
        await queryRunner.query(`ALTER TABLE "patients" RENAME COLUMN "patientSex" TO "sex"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Restaurar nombres originales
        await queryRunner.query(`ALTER TABLE "patients" RENAME COLUMN "sex" TO "patientSex"`);
        await queryRunner.query(`ALTER TABLE "patients" RENAME COLUMN "age" TO "patientAge"`);
        await queryRunner.query(`ALTER TABLE "patients" RENAME COLUMN "name" TO "patientName"`);
    }
}