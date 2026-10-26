import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CertificatesModule } from '../certificates/certificates.module';
import { CatalogModule } from '../catalog/catalog.module';
import { ActivityFinalizationService } from './activity-finalization.service';
import { ActivitiesService } from './activities.service';
import { ActivitiesController } from './activities.controller';
import { ActivityEntity } from './entities/activity.entity';
import { EnrollmentEntity } from './entities/enrollment.entity';
import { SessionEntity } from './entities/session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ActivityEntity, EnrollmentEntity, SessionEntity]),
    CertificatesModule,
    CatalogModule,
  ],
  controllers: [ActivitiesController],
  providers: [ActivitiesService, ActivityFinalizationService],
  exports: [TypeOrmModule, ActivitiesService],
})
export class ActivitiesModule {}
