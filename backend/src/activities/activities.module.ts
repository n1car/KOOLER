import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityEntity } from './entities/activity.entity';
import { EnrollmentEntity } from './entities/enrollment.entity';
import { SessionEntity } from './entities/session.entity';
import { ActivitiesService } from './activities.service';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityEntity, EnrollmentEntity, SessionEntity])],
  providers: [ActivitiesService],
  exports: [TypeOrmModule, ActivitiesService],
})
export class ActivitiesModule {}
