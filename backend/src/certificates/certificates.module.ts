import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import PDFDocument from 'pdfkit';
import { ActivityEntity } from '../activities/entities/activity.entity';
import { EnrollmentEntity } from '../activities/entities/enrollment.entity';
import { SessionEntity } from '../activities/entities/session.entity';
import { AttendanceEntity } from '../attendance/entities/attendance.entity';
import { CertificatesController } from './certificates.controller';
import {
  CERTIFICATE_PDF_DOCUMENT_FACTORY,
  CertificatesService,
} from './certificates.service';
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
  providers: [
    CertificatesService,
    {
      provide: CERTIFICATE_PDF_DOCUMENT_FACTORY,
      useValue: (options: ConstructorParameters<typeof PDFDocument>[0]) =>
        new PDFDocument(options),
    },
  ],
  exports: [CertificatesService, TypeOrmModule],
})
export class CertificatesModule {}
