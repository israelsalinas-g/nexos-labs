import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

export class AddIsActiveToStoolTest1729765201000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add is_active column
    await queryRunner.addColumn(
      'stool_tests',
      new TableColumn({
        name: 'is_active',
        type: 'boolean',
        default: true,
        isNullable: false,
      }),
    );

    // Create index for fast status lookups
    await queryRunner.createIndex(
      'stool_tests',
      new TableIndex({
        name: 'IDX_stool_tests_is_active',
        columnNames: ['is_active'],
      }),
    );

    // Create composite index for patient + active status queries
    await queryRunner.createIndex(
      'stool_tests',
      new TableIndex({
        name: 'IDX_stool_tests_patient_active',
        columnNames: ['patient_id', 'is_active'],
      }),
    );

    // Create composite index for status + active queries (audit queries)
    await queryRunner.createIndex(
      'stool_tests',
      new TableIndex({
        name: 'IDX_stool_tests_status_active',
        columnNames: ['status', 'is_active'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indices
    await queryRunner.dropIndex('stool_tests', 'IDX_stool_tests_status_active');
    await queryRunner.dropIndex('stool_tests', 'IDX_stool_tests_patient_active');
    await queryRunner.dropIndex('stool_tests', 'IDX_stool_tests_is_active');

    // Drop column
    await queryRunner.dropColumn('stool_tests', 'is_active');
  }
}
