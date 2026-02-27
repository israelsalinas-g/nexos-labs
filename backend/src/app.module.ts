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
import { TestResponseTypesModule } from './features/test-response-types/test-response-types.module';
import { TestReferenceRangesModule } from './features/test-reference-ranges/test-reference-ranges.module';
import { PromotionsModule } from './features/promotions/promotions.module';
import { UnifiedTestResultsModule } from './features/unified-test-results/unified-test-results.module';
import { NotificationsModule } from './features/notifications/notifications.module';
import { LabSettingsModule } from './features/lab-settings/lab-settings.module';
import { LabSetting } from './entities/lab-setting.entity';
import { SeedResponseTypes } from './seed/seed.response-types';
import { SeedPromotions } from './seed/seed.promotions';
import { SeedDemoData } from './seed/seed.demo-data';
import { TestResponseType } from './entities/test-response-type.entity';
import { TestResponseOption } from './entities/test-response-option.entity';
import { Promotion } from './entities/promotion.entity';
import { TestProfile } from './entities/test-profile.entity';
import { TestSection } from './entities/test-section.entity';
import { TestDefinition } from './entities/test-definition.entity';
import { TestReferenceRange } from './entities/test-reference-range.entity';
import { Doctor } from './entities/doctor.entity';
import { Patient } from './entities/patient.entity';

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
    TypeOrmModule.forFeature([
      Role, User,
      TestResponseType, TestResponseOption,
      Promotion, TestProfile,
      TestSection, TestDefinition, TestReferenceRange,
      Doctor, Patient,
      LabSetting,
    ]),
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
    TestResponseTypesModule,
    TestReferenceRangesModule,
    PromotionsModule,
    UnifiedTestResultsModule,
    NotificationsModule,
    LabSettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService, SeedRolesAndUsers, SeedResponseTypes, SeedPromotions, SeedDemoData],
})
export class AppModule {}
