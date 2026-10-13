import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityEntity } from '../activities/entities/activity.entity';
import { EnrollmentEntity } from '../activities/entities/enrollment.entity';
import { SessionEntity } from '../activities/entities/session.entity';
import { AttendanceEntity } from '../attendance/entities/attendance.entity';
import { CertificatesController } from './certificates.controller';
import { CertificatesService } from './certificates.service';
import { CertificateEntity } from './entities/certificate.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CertificateEntity,
      ActivityEntity,
      SessionEntity,
      AttendanceEntity,
      EnrollmentEntity,
    ]),
  ],
  controllers: [CertificatesController],
  providers: [CertificatesService],
  exports: [CertificatesService, TypeOrmModule],
})
export class CertificatesModule {}
