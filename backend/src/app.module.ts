import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SeedRolesAndUsers } from './seed/seed.roles-users';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';

import { DymindDh36ResultsModule } from './features/dymind-dh36-results/dymind-dh36-results.module';
import { LisServerModule } from './features/lis-server/lis-server.module';
import { PatientsModule } from './features/patients/patients.module';
import { IChromaResultsModule } from './features/ichroma-results/ichroma-results.module';
import { IChromaTcpServerModule } from './features/ichroma-tcp-server/ichroma-tcp-server.module';
import { UrineTestsModule } from './features/urine-tests/urine-tests.module';
import { StoolTestsModule } from './features/stool-tests/stool-tests.module';
import { DashboardModule } from './features/dashboard/dashboard.module';
import { PatientHistoryModule } from './features/patient-history/patient-history.module';
import { TestSectionsModule } from './features/test-sections/test-sections.module';
import { TestDefinitionsModule } from './features/test-definitions/test-definitions.module';
import { TestProfilesModule } from './features/test-profiles/test-profiles.module';
import { TestResultsModule } from './features/test-results/test-results.module';
import { DoctorsModule } from './features/doctors/doctors.module';
import { LaboratoryOrdersModule } from './features/laboratory-orders/laboratory-orders.module';
import { AuthModule } from './features/auth/auth.module';
import { UsersModule } from './features/users/users.module';
import { RolesModule } from './features/roles/roles.module';
import { UploadModule } from './features/upload/upload.module';

import { getDatabaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Role, User]),
    DymindDh36ResultsModule,
    LisServerModule,
    PatientsModule,
    IChromaResultsModule,
    IChromaTcpServerModule,
    UrineTestsModule,
    StoolTestsModule,
    DashboardModule,
    PatientHistoryModule,
    TestSectionsModule,
    TestDefinitionsModule,
    TestProfilesModule,
    TestResultsModule,
    DoctorsModule,
    LaboratoryOrdersModule,
    AuthModule,
    UsersModule,
    RolesModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService, SeedRolesAndUsers],
})
export class AppModule {}
