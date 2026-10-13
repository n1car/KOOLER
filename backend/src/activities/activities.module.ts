import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CertificatesModule } from '../certificates/certificates.module';
import { ActivityFinalizationService } from './activity-finalization.service';
import { ActivityEntity } from './entities/activity.entity';
import { EnrollmentEntity } from './entities/enrollment.entity';
import { SessionEntity } from './entities/session.entity';
import { ActivitiesService } from './activities.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ActivityEntity, EnrollmentEntity, SessionEntity]),
    CertificatesModule,
  ],
  providers: [ActivitiesService, ActivityFinalizationService],
  exports: [TypeOrmModule, ActivitiesService],
})
export class ActivitiesModule {}
