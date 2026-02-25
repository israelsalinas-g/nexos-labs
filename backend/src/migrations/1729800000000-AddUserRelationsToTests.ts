import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserRelationsToTests1729800000000 implements MigrationInterface {
  name = 'AddUserRelationsToTests1729800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // STOOL_TESTS: Eliminar campos de texto y agregar relaciones con usuarios
    
    // Eliminar columnas antiguas de texto
    await queryRunner.query(`
      ALTER TABLE "stool_tests" 
      DROP COLUMN IF EXISTS "technician"
    `);
    
    await queryRunner.query(`
      ALTER TABLE "stool_tests" 
      DROP COLUMN IF EXISTS "reviewed_by"
    `);

    // Agregar nuevas columnas de relación con usuarios
    await queryRunner.query(`
      ALTER TABLE "stool_tests" 
      ADD COLUMN "created_by_id" uuid NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "stool_tests" 
      ADD COLUMN "reviewed_by_id" uuid NULL
    `);

    // Agregar foreign keys para stool_tests
    await queryRunner.query(`
      ALTER TABLE "stool_tests" 
      ADD CONSTRAINT "FK_stool_tests_created_by" 
      FOREIGN KEY ("created_by_id") 
      REFERENCES "users"("id") 
      ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "stool_tests" 
      ADD CONSTRAINT "FK_stool_tests_reviewed_by" 
      FOREIGN KEY ("reviewed_by_id") 
      REFERENCES "users"("id") 
      ON DELETE SET NULL
    `);

    // URINE_TESTS: Agregar relaciones con usuarios
    
    await queryRunner.query(`
      ALTER TABLE "urine_tests" 
      ADD COLUMN "created_by_id" uuid NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "urine_tests" 
      ADD COLUMN "reviewed_by_id" uuid NULL
    `);

    // Agregar foreign keys para urine_tests
    await queryRunner.query(`
      ALTER TABLE "urine_tests" 
      ADD CONSTRAINT "FK_urine_tests_created_by" 
      FOREIGN KEY ("created_by_id") 
      REFERENCES "users"("id") 
      ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "urine_tests" 
      ADD CONSTRAINT "FK_urine_tests_reviewed_by" 
      FOREIGN KEY ("reviewed_by_id") 
      REFERENCES "users"("id") 
      ON DELETE SET NULL
    `);

    // Agregar índices para mejorar rendimiento
    await queryRunner.query(`
      CREATE INDEX "IDX_stool_tests_created_by_id" 
      ON "stool_tests" ("created_by_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_stool_tests_reviewed_by_id" 
      ON "stool_tests" ("reviewed_by_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_urine_tests_created_by_id" 
      ON "urine_tests" ("created_by_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_urine_tests_reviewed_by_id" 
      ON "urine_tests" ("reviewed_by_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir cambios en orden inverso

    // Eliminar índices
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_urine_tests_reviewed_by_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_urine_tests_created_by_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_stool_tests_reviewed_by_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_stool_tests_created_by_id"`);

    // Eliminar foreign keys y columnas de urine_tests
    await queryRunner.query(`
      ALTER TABLE "urine_tests" 
      DROP CONSTRAINT IF EXISTS "FK_urine_tests_reviewed_by"
    `);

    await queryRunner.query(`
      ALTER TABLE "urine_tests" 
      DROP CONSTRAINT IF EXISTS "FK_urine_tests_created_by"
    `);

    await queryRunner.query(`
      ALTER TABLE "urine_tests" 
      DROP COLUMN IF EXISTS "reviewed_by_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "urine_tests" 
      DROP COLUMN IF EXISTS "created_by_id"
    `);

    // Eliminar foreign keys y columnas de stool_tests
    await queryRunner.query(`
      ALTER TABLE "stool_tests" 
      DROP CONSTRAINT IF EXISTS "FK_stool_tests_reviewed_by"
    `);

    await queryRunner.query(`
      ALTER TABLE "stool_tests" 
      DROP CONSTRAINT IF EXISTS "FK_stool_tests_created_by"
    `);

    await queryRunner.query(`
      ALTER TABLE "stool_tests" 
      DROP COLUMN IF EXISTS "reviewed_by_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "stool_tests" 
      DROP COLUMN IF EXISTS "created_by_id"
    `);

    // Restaurar columnas antiguas de texto en stool_tests
    await queryRunner.query(`
      ALTER TABLE "stool_tests" 
      ADD COLUMN "reviewed_by" varchar NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "stool_tests" 
      ADD COLUMN "technician" varchar NULL
    `);
  }
}
