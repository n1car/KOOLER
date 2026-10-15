import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ActivitiesModule } from './activities/activities.module';
import { SeedModule } from './database/seed.module';
import { ReviewsModule } from './reviews/reviews.module';
import { HistoryModule } from './history/history.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, HistoryModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST') ?? 'localhost',
        port: Number(configService.get<string>('DB_PORT') ?? 5433),
        username: configService.get<string>('DB_USERNAME') ?? 'postgres',
        password: configService.get<string>('DB_PASSWORD') ?? 'postgres',
        database: configService.get<string>('DB_DATABASE') ?? 'kooler_db',
        autoLoadEntities: true,
        synchronize: true, // Modo desarrollo, igual que en clase
      }),
    }),
    UsersModule,
    AuthModule,
    ActivitiesModule,
    SeedModule,
    ReviewsModule,
  ],
})
export class AppModule {}
