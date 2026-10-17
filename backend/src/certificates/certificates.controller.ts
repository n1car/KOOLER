import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CertificatesService } from './certificates.service';

interface AuthenticatedUser {
  id: number;
}

@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ESTUDIANTE')
  @Get()
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ESTUDIANTE')
  @Get('activities/:activityId/eligibility')
  getMyEligibility(
    @CurrentUser() user: AuthenticatedUser,
    @Param('activityId', ParseIntPipe) activityId: number,
  ) {
    return this.certificatesService.getEligibilityForStudent(
      user.id,
      activityId,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ESTUDIANTE')
  @Get(':certificateId/download')
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
