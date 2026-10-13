import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { CertificateEntity } from './entities/certificate.entity';

@Injectable()
export class CertificatesService {
  constructor(
    @InjectRepository(CertificateEntity)
    private readonly certificateRepository: Repository<CertificateEntity>,
  ) {}

  async findByStudentId(studentId: number): Promise<CertificateEntity[]> {
    return this.certificateRepository.find({
      where: { user: { id: studentId } },
      relations: { activity: true, user: true },
      order: { issueDate: 'DESC' },
    });
  }

  async findOneByStudentAndActivity(
    studentId: number,
    activityId: number,
  ): Promise<CertificateEntity | null> {
    return this.certificateRepository.findOne({
      where: {
        user: { id: studentId },
        activity: { id: activityId },
      },
      relations: { activity: true, user: true },
    });
  }

  async issueCertificate(
    studentId: number,
    activityId: number,
  ): Promise<CertificateEntity> {
    const existing = await this.findOneByStudentAndActivity(studentId, activityId);
    if (existing) {
      throw new ConflictException(
        'Ya existe un certificado emitido para este estudiante en la actividad',
      );
    }

    const certificateCode = await this.generateUniqueCode();

    const certificate = this.certificateRepository.create({
      user: { id: studentId } as any,
      activity: { id: activityId } as any,
      certificateCode,
    });

    try {
      return await this.certificateRepository.save(certificate);
    } catch (error) {
      if (this.isDuplicateCodeError(error)) {
        throw new ConflictException(
          'El código de certificado ya existe; intente nuevamente',
        );
      }
      throw new InternalServerErrorException(
        'No se pudo registrar el certificado',
      );
    }
  }

  private async generateUniqueCode(): Promise<string> {
    const candidate = randomUUID().replace(/-/g, '').slice(0, 24).toUpperCase();

    const existing = await this.certificateRepository.findOne({
      where: { certificateCode: candidate },
    });

    if (existing) {
      return this.generateUniqueCode();
    }

    return candidate;
  }

  private isDuplicateCodeError(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) {
      return false;
    }

    const driverError = error.driverError;
    return driverError?.code === '23505';
  }
}
