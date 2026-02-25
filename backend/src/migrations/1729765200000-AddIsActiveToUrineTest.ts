import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

export class AddIsActiveToUrineTest1729765200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar columna is_active a urine_tests
    await queryRunner.addColumn(
      'urine_tests',
      new TableColumn({
        name: 'is_active',
        type: 'boolean',
        default: true,
        isNullable: false,
        comment: 'Indicador de soft-delete para auditoría y compliance'
      })
    );

    // Crear índice para búsquedas rápidas por estado activo/inactivo
    await queryRunner.createIndex(
      'urine_tests',
      new TableIndex({
        name: 'IDX_urine_tests_is_active',
        columnNames: ['is_active']
      })
    );

    // Crear índice compuesto para consultas comunes (paciente + activo)
    await queryRunner.createIndex(
      'urine_tests',
      new TableIndex({
        name: 'IDX_urine_tests_patient_active',
        columnNames: ['patient_id', 'is_active']
      })
    );

    // Crear índice compuesto para auditoría (estado + activo)
    await queryRunner.createIndex(
      'urine_tests',
      new TableIndex({
        name: 'IDX_urine_tests_status_active',
        columnNames: ['status', 'is_active']
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover índices
    await queryRunner.dropIndex('urine_tests', 'IDX_urine_tests_status_active');
    await queryRunner.dropIndex('urine_tests', 'IDX_urine_tests_patient_active');
    await queryRunner.dropIndex('urine_tests', 'IDX_urine_tests_is_active');

    // Remover columna
    await queryRunner.dropColumn('urine_tests', 'is_active');
  }
}
