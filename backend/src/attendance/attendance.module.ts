import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivitiesModule } from '../activities/activities.module';
import { SessionEntity } from '../activities/entities/session.entity';
import { UsersModule } from '../users/users.module';
import { AttendanceController } from './attendance.controller';
import { AttendanceEntity } from './entities/attendance.entity';
import { AttendanceService } from './attendance.service';

@Module({
  controllers: [AttendanceController],
  imports: [
    TypeOrmModule.forFeature([AttendanceEntity, SessionEntity]),
    UsersModule,
    ActivitiesModule,
  ],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
