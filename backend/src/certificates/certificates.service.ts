import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import PDFDocument from 'pdfkit';
import { In, QueryFailedError, Repository } from 'typeorm';
import { ActivityEntity } from '../activities/entities/activity.entity';
import { EnrollmentEntity } from '../activities/entities/enrollment.entity';
import { SessionEntity } from '../activities/entities/session.entity';
import { AttendanceEntity } from '../attendance/entities/attendance.entity';
import { CertificateEntity } from './entities/certificate.entity';

const MINIMUM_ATTENDANCE_PERCENTAGE = 80;
const CERTIFICATE_CODE_ATTEMPTS = 3;
export const CERTIFICATE_PDF_DOCUMENT_FACTORY = Symbol(
  'CERTIFICATE_PDF_DOCUMENT_FACTORY',
);
type CertificatePdfDocumentFactory = (
  options: ConstructorParameters<typeof PDFDocument>[0],
) => InstanceType<typeof PDFDocument>;

export type EligibilityReason =
  | 'ACTIVITY_NOT_FINISHED'
  | 'ACTIVITY_NOT_CERTIFIABLE'
  | 'NO_SESSIONS'
  | 'BELOW_MINIMUM';

export interface CertificateEligibility {
  activityId: number;
  sessionsTotal: number;
  sessionsPresent: number;
  attendancePercentage: number;
  minimumAttendancePercentage: number;
  eligible: boolean;
  reason?: EligibilityReason;
}

export interface CertificateIssuanceSummary {
  activityId: number;
  eligibleStudents: number;
  issuedCertificates: number;
  existingCertificates: number;
  failedStudents: number;
}

@Injectable()
export class CertificatesService {
  private readonly logger = new Logger(CertificatesService.name);

  constructor(
    @InjectRepository(CertificateEntity)
    private readonly certificateRepository: Repository<CertificateEntity>,
    @InjectRepository(ActivityEntity)
    private readonly activityRepository: Repository<ActivityEntity>,
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>,
    @InjectRepository(AttendanceEntity)
    private readonly attendanceRepository: Repository<AttendanceEntity>,
    @InjectRepository(EnrollmentEntity)
    private readonly enrollmentRepository: Repository<EnrollmentEntity>,
    @Inject(CERTIFICATE_PDF_DOCUMENT_FACTORY)
    private readonly createPdfDocument: CertificatePdfDocumentFactory,
  ) {}

  async findByStudentId(studentId: number): Promise<CertificateEntity[]> {
    return this.certificateRepository.find({
      where: { user: { id: studentId } },
      relations: { activity: true, user: true },
      order: { issueDate: 'DESC' },
    });
  }

  async downloadCertificatePdf(
    studentId: number,
    certificateId: number,
  ): Promise<{ content: Buffer; fileName: string }> {
    const certificate = await this.certificateRepository.findOne({
      where: { id: certificateId, user: { id: studentId } },
      relations: { activity: true, user: true },
    });
    if (!certificate) {
      throw new NotFoundException('Certificado no encontrado');
    }

    const studentName =
      `${certificate.user.firstName} ${certificate.user.lastName}`.trim();
    try {
      return {
        content: await this.renderCertificatePdf({
          studentName,
          activityName: certificate.activity.name,
          certificateCode: certificate.certificateCode,
          issueDate: certificate.issueDate,
        }),
        fileName: `certificate-${certificate.certificateCode}.pdf`,
      };
    } catch (error) {
      this.logger.error(
        `No se pudo generar el PDF del certificado ${certificate.id}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException(
        'No se pudo generar el PDF del certificado',
      );
    }
  }

  async getEligibilityForStudent(
    studentId: number,
    activityId: number,
  ): Promise<CertificateEligibility> {
    const activity = await this.findActivity(activityId);
    const enrollment = await this.enrollmentRepository.findOne({
      where: { activity: { id: activityId }, user: { id: studentId } },
    });

    if (!enrollment) {
      throw new ForbiddenException(
        'Solo puedes consultar la elegibilidad de actividades en las que estás inscrito',
      );
    }

    const sessions = await this.findActivitySessions(activityId);
    const attendances = await this.findAttendancesForSessions(
      studentId,
      sessions.map((session) => session.id),
    );

    return this.calculateEligibility(activity, studentId, sessions, attendances);
  }

  async issueEligibleCertificates(
    activityId: number,
  ): Promise<CertificateIssuanceSummary> {
    const activity = await this.findActivity(activityId);

    if (activity.status !== 'FINISHED') {
      throw new BadRequestException(
        'Solo se pueden emitir certificados para actividades finalizadas',
      );
    }

    if (!activity.isCertifiable) {
      return {
        activityId,
        eligibleStudents: 0,
        issuedCertificates: 0,
        existingCertificates: 0,
        failedStudents: 0,
      };
    }

    const sessions = await this.findActivitySessions(activityId);
    if (sessions.length === 0) {
      return {
        activityId,
        eligibleStudents: 0,
        issuedCertificates: 0,
        existingCertificates: 0,
        failedStudents: 0,
      };
    }

    const enrollments = await this.enrollmentRepository.find({
      where: { activity: { id: activityId } },
      relations: { user: true },
    });
    const attendances = await this.findAttendancesForSessions(
      undefined,
      sessions.map((session) => session.id),
    );

    let eligibleStudents = 0;
    let issuedCertificates = 0;
    let existingCertificates = 0;
    let failedStudents = 0;

    for (const enrollment of enrollments) {
      const studentId = enrollment.user.id;
      const eligibility = this.calculateEligibility(
        activity,
        studentId,
        sessions,
        attendances,
      );

      if (!eligibility.eligible) {
        continue;
      }

      eligibleStudents += 1;
      try {
        const result = await this.issueCertificate(studentId, activityId);
        if (result.created) {
          issuedCertificates += 1;
        } else {
          existingCertificates += 1;
        }
      } catch (error) {
        failedStudents += 1;
        this.logger.error(
          `No se pudo emitir certificado para estudiante ${studentId} en actividad ${activityId}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }

    return {
      activityId,
      eligibleStudents,
      issuedCertificates,
      existingCertificates,
      failedStudents,
    };
  }

  private async findActivity(activityId: number): Promise<ActivityEntity> {
    const activity = await this.activityRepository.findOneBy({ id: activityId });
    if (!activity) {
      throw new NotFoundException('Actividad no encontrada');
    }
    return activity;
  }

  private async findActivitySessions(activityId: number): Promise<SessionEntity[]> {
    const sessions = await this.sessionRepository.find({
      where: { activity: { id: activityId } },
    });
    const uniqueSessions = new Map(sessions.map((session) => [session.id, session]));
    return [...uniqueSessions.values()];
  }

  private async findAttendancesForSessions(
    studentId: number | undefined,
    sessionIds: number[],
  ): Promise<AttendanceEntity[]> {
    if (sessionIds.length === 0) {
      return [];
    }

    return this.attendanceRepository.find({
      where: {
        session: { id: In(sessionIds) },
        ...(studentId === undefined ? {} : { user: { id: studentId } }),
      },
      relations: { session: true, user: true },
    });
  }

  private calculateEligibility(
    activity: ActivityEntity,
    studentId: number,
    sessions: SessionEntity[],
    attendances: AttendanceEntity[],
  ): CertificateEligibility {
    // Contar sesiones únicas evita duplicar el porcentaje si llegan registros repetidos.
    const sessionIds = new Set(sessions.map((session) => session.id));
    const presentSessionIds = new Set(
      attendances
        .filter(
          (attendance) =>
            attendance.user.id === studentId &&
            sessionIds.has(attendance.session.id) &&
            attendance.status === 'PRESENT',
        )
        .map((attendance) => attendance.session.id),
    );
    const sessionsTotal = sessionIds.size;
    const sessionsPresent = presentSessionIds.size;
    const attendancePercentage =
      sessionsTotal === 0 ? 0 : (sessionsPresent / sessionsTotal) * 100;

    let reason: EligibilityReason | undefined;
    if (activity.status !== 'FINISHED') {
      reason = 'ACTIVITY_NOT_FINISHED';
    } else if (!activity.isCertifiable) {
      reason = 'ACTIVITY_NOT_CERTIFIABLE';
    } else if (sessionsTotal === 0) {
      reason = 'NO_SESSIONS';
    } else if (
      sessionsPresent * 100 <
      sessionsTotal * MINIMUM_ATTENDANCE_PERCENTAGE
    ) {
      reason = 'BELOW_MINIMUM';
    }

    return {
      activityId: activity.id,
      sessionsTotal,
      sessionsPresent,
      attendancePercentage,
      minimumAttendancePercentage: MINIMUM_ATTENDANCE_PERCENTAGE,
      eligible: reason === undefined,
      ...(reason ? { reason } : {}),
    };
  }

  private async issueCertificate(
    studentId: number,
    activityId: number,
  ): Promise<{ certificate: CertificateEntity; created: boolean }> {
    const existing = await this.certificateRepository.findOne({
      where: {
        user: { id: studentId },
        activity: { id: activityId },
      },
      relations: { activity: true, user: true },
    });
    if (existing) {
      return { certificate: existing, created: false };
    }

    for (let attempt = 0; attempt < CERTIFICATE_CODE_ATTEMPTS; attempt += 1) {
      const certificate = this.certificateRepository.create({
        user: { id: studentId },
        activity: { id: activityId },
        certificateCode: randomUUID().replace(/-/g, '').toUpperCase(),
      });

      try {
        return {
          certificate: await this.certificateRepository.save(certificate),
          created: true,
        };
      } catch (error) {
        if (!this.isUniqueConstraintError(error)) {
          throw new InternalServerErrorException(
            'No se pudo registrar el certificado',
          );
        }

        // Si otra petición ya lo emitió, se reutiliza; si chocó el código, se reintenta.
        const concurrentlyCreated = await this.certificateRepository.findOne({
          where: {
            user: { id: studentId },
            activity: { id: activityId },
          },
          relations: { activity: true, user: true },
        });
        if (concurrentlyCreated) {
          return { certificate: concurrentlyCreated, created: false };
        }
      }
    }

    throw new InternalServerErrorException(
      'No se pudo generar un código único de certificado',
    );
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return (
      error instanceof QueryFailedError &&
      error.driverError?.code === '23505'
    );
  }

  private renderCertificatePdf(data: {
    studentName: string;
    activityName: string;
    certificateCode: string;
    issueDate: Date;
  }): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const document = this.createPdfDocument({ size: 'A4', margin: 56 });
      const chunks: Buffer[] = [];

      document.on('data', (chunk: Buffer) => chunks.push(chunk));
      document.on('error', reject);
      document.on('end', () => resolve(Buffer.concat(chunks)));

      document
        .fontSize(24)
        .text('Certificado de participacion', { align: 'center' })
        .moveDown(2)
        .fontSize(14)
        .text('Se certifica que', { align: 'center' })
        .moveDown()
        .fontSize(20)
        .text(data.studentName, { align: 'center' })
        .moveDown()
        .fontSize(14)
        .text('participo en', { align: 'center' })
        .moveDown()
        .fontSize(18)
        .text(data.activityName, { align: 'center' })
        .moveDown(2)
        .fontSize(11)
        .text(`Codigo de certificado: ${data.certificateCode}`, {
          align: 'center',
        })
        .text(
          `Fecha de emision: ${new Intl.DateTimeFormat('es-CO', {
            dateStyle: 'long',
            timeZone: 'America/Bogota',
          }).format(data.issueDate)}`,
          { align: 'center' },
        );

      document.end();
    });
  }
}
