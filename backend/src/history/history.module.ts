import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnrollmentEntity } from '../activities/entities/enrollment.entity';
import { ActivityEntity } from '../activities/entities/activity.entity';
import { AttendanceEntity } from '../attendance/entities/attendance.entity';
import { ReviewEntity } from '../reviews/entities/review.entity';
import { HistoryService } from './history.service';
import { HistoryController } from './history.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EnrollmentEntity, ActivityEntity, AttendanceEntity, ReviewEntity])],
  controllers: [HistoryController],
  providers: [HistoryService],
})
export class HistoryModule {}