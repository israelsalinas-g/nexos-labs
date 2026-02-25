import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePatientEnums1759712039126 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Eliminar el enum existente después de cambiar la columna a varchar
        await queryRunner.query(`
            ALTER TABLE patients 
            ALTER COLUMN "patientSex" TYPE varchar;
        `);
        await queryRunner.query(`DROP TYPE IF EXISTS patients_patientsex_enum`);

        // Crear los nuevos tipos enum
        await queryRunner.query(`
            CREATE TYPE patients_blood_type_enum AS ENUM (
                'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'UNKNOWN'
            )
        `);

        await queryRunner.query(`
            CREATE TYPE patients_patient_sex_enum AS ENUM (
                'MALE', 'FEMALE', 'OTHER'
            )
        `);

        // Convertir las columnas a los nuevos tipos enum
        await queryRunner.query(`
            ALTER TABLE patients 
            ALTER COLUMN "bloodType" TYPE patients_blood_type_enum USING 'UNKNOWN'::patients_blood_type_enum,
            ALTER COLUMN "patientSex" TYPE patients_patient_sex_enum USING 'OTHER'::patients_patient_sex_enum
        `);

        // Establecer valores por defecto
        await queryRunner.query(`
            ALTER TABLE patients 
            ALTER COLUMN "bloodType" SET DEFAULT 'UNKNOWN'::patients_blood_type_enum,
            ALTER COLUMN "patientSex" SET DEFAULT 'OTHER'::patients_patient_sex_enum
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revertir columnas a tipo texto
        await queryRunner.query(`
            ALTER TABLE patients 
            ALTER COLUMN "bloodType" TYPE varchar USING "bloodType"::text,
            ALTER COLUMN "patientSex" TYPE varchar USING "patientSex"::text
        `);

        // Eliminar tipos enum
        await queryRunner.query(`DROP TYPE IF EXISTS patients_blood_type_enum`);
        await queryRunner.query(`DROP TYPE IF EXISTS patients_patient_sex_enum`);
    }

}
