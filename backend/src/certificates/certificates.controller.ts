import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  StreamableFile,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CertificatesService } from './certificates.service';

interface AuthenticatedUser {
  id: number;
}

@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Get()
  @Roles('ESTUDIANTE')
  async getMyCertificates(@CurrentUser() user: AuthenticatedUser) {
    const certificates = await this.certificatesService.findByStudentId(user.id);

    if (certificates.length === 0) {
      throw new NotFoundException('No tienes certificados emitidos');
    }

    return certificates.map((certificate) => ({
      id: certificate.id,
      studentId: certificate.user.id,
      activityId: certificate.activity.id,
      certificateCode: certificate.certificateCode,
      issueDate: certificate.issueDate,
    }));
  }

  @Get('activities/:activityId/eligibility')
  @Roles('ESTUDIANTE')
  getMyEligibility(
    @CurrentUser() user: AuthenticatedUser,
    @Param('activityId', ParseIntPipe) activityId: number,
  ) {
    return this.certificatesService.getEligibilityForStudent(
      user.id,
      activityId,
    );
  }

  @Get(':certificateId/download')
  @Roles('ESTUDIANTE')
  async downloadMyCertificate(
    @CurrentUser() user: AuthenticatedUser,
    @Param('certificateId', ParseIntPipe) certificateId: number,
  ): Promise<StreamableFile> {
    const { content, fileName } =
      await this.certificatesService.downloadCertificatePdf(
        user.id,
        certificateId,
      );
    return new StreamableFile(content, {
      type: 'application/pdf',
      disposition: `attachment; filename="${fileName}"`,
    });
  }
}
