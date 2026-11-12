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
      // En local se usa backend/.env; neon deploy escribe ../.env.local.
      envFilePath: ['.env', '../.env.local'],
      validate: validateEnv,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbSsl = configService
          .get<string>('DB_SSL')
          ?.trim()
          .toLowerCase();
        const databaseUrl =
          configService.get<string>('DATABASE_URL_UNPOOLED') ??
          configService.get<string>('DATABASE_URL');
        const urlRequiresSsl =
          databaseUrl !== undefined &&
          /sslmode=(require|verify-ca|verify-full)/i.test(databaseUrl);
        const sslEnabled =
          dbSsl === 'true' ||
          dbSsl === '1' ||
          (urlRequiresSsl && dbSsl !== 'false' && dbSsl !== '0');

        const baseOptions = {
          type: 'postgres' as const,
          // Neon y otros proveedores exigen SSL. En local (docker) queda en false.
          ssl: sslEnabled ? { rejectUnauthorized: false } : false,
          autoLoadEntities: true,
          // TypeORM aplica los cambios de entidades al esquema al iniciar.
          synchronize: true, // Modo desarrollo, igual que en clase
        };

        if (databaseUrl) {
          // Neon: la URL directa evita problemas de PgBouncer con synchronize.
          return { ...baseOptions, url: databaseUrl };
        }

        return {
          ...baseOptions,
          host: configService.get<string>('DB_HOST') ?? 'localhost',
          port: Number(configService.get<string>('DB_PORT') ?? 5433),
          username: configService.get<string>('DB_USERNAME') ?? 'postgres',
          password: configService.get<string>('DB_PASSWORD') ?? 'postgres',
          database: configService.get<string>('DB_DATABASE') ?? 'kooler_db',
        };
      },
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
