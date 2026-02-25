import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

export class AddSampleNumberToOrderTestAndTestResult1729605600000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar sampleNumber a order_tests
    await queryRunner.addColumn(
      'order_tests',
      new TableColumn({
        name: 'sample_number',
        type: 'varchar',
        length: '50',
        isNullable: true,
        comment: 'Identificador único de la muestra (ej: MUESTRA-001-2025-10-22)',
      })
    );

    // Agregar índice para sampleNumber en order_tests
    await queryRunner.createIndex(
      'order_tests',
      new TableIndex({
        name: 'IDX_order_tests_sample_number',
        columnNames: ['sample_number'],
        isUnique: false,
      })
    );

    // Agregar sampleNumber a test_results
    await queryRunner.addColumn(
      'test_results',
      new TableColumn({
        name: 'sample_number',
        type: 'varchar',
        length: '50',
        isNullable: true,
        comment: 'Identificador único de la muestra',
      })
    );

    // Agregar índice para sampleNumber en test_results
    await queryRunner.createIndex(
      'test_results',
      new TableIndex({
        name: 'IDX_test_results_sample_number',
        columnNames: ['sample_number'],
        isUnique: false,
      })
    );

    // Agregar columna testedAt en test_results si no existe
    const testResultsTable = await queryRunner.getTable('test_results');
    if (testResultsTable && !testResultsTable.findColumnByName('tested_at')) {
      await queryRunner.addColumn(
        'test_results',
        new TableColumn({
          name: 'tested_at',
          type: 'timestamp',
          isNullable: true,
          default: 'CURRENT_TIMESTAMP',
          comment: 'Fecha y hora cuando se realizó el test',
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover índices
    await queryRunner.dropIndex('test_results', 'IDX_test_results_sample_number');
    await queryRunner.dropIndex('order_tests', 'IDX_order_tests_sample_number');

    // Remover columnas
    await queryRunner.dropColumn('test_results', 'tested_at');
    await queryRunner.dropColumn('test_results', 'sample_number');
    await queryRunner.dropColumn('order_tests', 'sample_number');
  }
}
