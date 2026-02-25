import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateStoolEnums1759623418195 implements MigrationInterface {
    name = 'UpdateStoolEnums1759623418195'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."stool_tests_color_enum" AS ENUM('amarillo', 'negro', 'blanco', 'cafe', 'verde', 'rojo')`);
        await queryRunner.query(`CREATE TYPE "public"."stool_tests_consistency_enum" AS ENUM('blanda', 'formada', 'pastosa', 'liquida', 'diarreica')`);
        await queryRunner.query(`CREATE TYPE "public"."stool_tests_shape_enum" AS ENUM('escaso', 'moderado', 'abundante')`);
        await queryRunner.query(`CREATE TYPE "public"."stool_tests_mucus_enum" AS ENUM('escaso', 'moderado', 'abundante', 'no_se_observa')`);
        await queryRunner.query(`CREATE TABLE "stool_tests" ("id" SERIAL NOT NULL, "patient_id" uuid, "color" "public"."stool_tests_color_enum" NOT NULL DEFAULT 'cafe', "consistency" "public"."stool_tests_consistency_enum" NOT NULL DEFAULT 'formada', "shape" "public"."stool_tests_shape_enum" NOT NULL DEFAULT 'moderado', "mucus" "public"."stool_tests_mucus_enum" NOT NULL DEFAULT 'no_se_observa', "leukocytes" "public"."stool_tests_leukocytes_enum" NOT NULL DEFAULT 'no_se_observa', "erythrocytes" "public"."stool_tests_erythrocytes_enum" NOT NULL DEFAULT 'no_se_observa', "parasites" jsonb NOT NULL DEFAULT '[{"type":"NO SE OBSERVAN EN ESTA MUESTRA","quantity":""}]', "protozoos" jsonb NOT NULL DEFAULT '[{"type":"NO SE OBSERVA EN ESTA MUESTRA","quantity":""}]', "sample_number" character varying NOT NULL, "test_date" TIMESTAMP NOT NULL DEFAULT now(), "observations" text, "status" character varying NOT NULL DEFAULT 'pending', "technician" character varying, "reviewed_by" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_25a75101ca7569bf9a79b7b7110" UNIQUE ("sample_number"), CONSTRAINT "PK_9287597ac075482d3838c185f06" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "stool_tests" ADD CONSTRAINT "FK_543038aabe90d9bb46ec9744bc5" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stool_tests" DROP CONSTRAINT "FK_543038aabe90d9bb46ec9744bc5"`);
        await queryRunner.query(`DROP TABLE "stool_tests"`);
        await queryRunner.query(`DROP TYPE "public"."stool_tests_mucus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."stool_tests_shape_enum"`);
        await queryRunner.query(`DROP TYPE "public"."stool_tests_consistency_enum"`);
        await queryRunner.query(`DROP TYPE "public"."stool_tests_color_enum"`);
    }

}
