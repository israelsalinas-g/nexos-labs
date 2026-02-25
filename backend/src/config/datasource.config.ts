import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { Doctor, DymindDh36Result, TestSection, IChromaResult, LaboratoryOrder, OrderTest, Patient, StoolTest, TestDefinition, TestProfile, TestResult, UrineTest } from 'src/entities';

dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'nexos_labs_db',
  // entities: ['dist/**/*.entity{.ts,.js}'],
  // migrations: ['dist/migrations/*{.ts,.js}'],
  entities: [
    Doctor,
    Patient,
    TestSection,
    TestDefinition,
    TestProfile,
    TestResult,
    LaboratoryOrder,
    OrderTest,
    DymindDh36Result,
    IChromaResult,
    UrineTest,
    StoolTest,
  ],
  synchronize: true,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
