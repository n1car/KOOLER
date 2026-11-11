import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ActivitiesModule } from './activities/activities.module';
import { CatalogModule } from './catalog/catalog.module';
import { AttendanceModule } from './attendance/attendance.module';
import { CertificatesModule } from './certificates/certificates.module';
import { SeedModule } from './database/seed.module';
import { ReviewsModule } from './reviews/reviews.module';
import { HistoryModule } from './history/history.module';
import { HealthModule } from './health/health.module';
import { validateEnv } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST') ?? 'localhost',
        port: Number(configService.get<string>('DB_PORT') ?? 5433),
        username: configService.get<string>('DB_USERNAME') ?? 'postgres',
        password: configService.get<string>('DB_PASSWORD') ?? 'postgres',
        database: configService.get<string>('DB_DATABASE') ?? 'kooler_db',
        autoLoadEntities: true,
        // TypeORM aplica los cambios de entidades al esquema al iniciar.
        synchronize: true, // Modo desarrollo, igual que en clase
      }),
    }),
    UsersModule,
    AuthModule,
    ActivitiesModule,
    CatalogModule,
    AttendanceModule,
    CertificatesModule,
    SeedModule,
    ReviewsModule,
    HistoryModule,
    HealthModule,
  ],
})
export class AppModule {}
