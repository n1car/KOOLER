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
import { hasSessionEndElapsed } from '../activities/session-time';
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
type CertificatePdfDocument = InstanceType<typeof PDFDocument>;

const CERTIFICATE_COLORS = {
  ivory: '#FBFAF6',
  navy: '#102A43',
  blue: '#245B83',
  gold: '#B89555',
  ink: '#273746',
  muted: '#667786',
  white: '#FFFFFF',
};

function drawFittedText(
  document: CertificatePdfDocument,
  text: string,
  options: {
    x: number;
    y: number;
    width: number;
    height: number;
    font: string;
    maxFontSize: number;
    minFontSize: number;
    color: string;
  },
): void {
  let fontSize = options.maxFontSize;
  document.font(options.font);
  while (fontSize > options.minFontSize) {
    document.fontSize(fontSize);
    if (document.heightOfString(text, { width: options.width }) <= options.height) {
      break;
    }
    fontSize -= 1;
  }

  document
    .fontSize(fontSize)
    .fillColor(options.color)
    .text(text, options.x, options.y, {
      width: options.width,
      align: 'center',
      lineGap: 2,
    });
}

export type EligibilityReason =
  | 'ACTIVITY_NOT_FINISHED'
  | 'ACTIVITY_NOT_CERTIFIABLE'
  | 'NO_SESSIONS'
  | 'SESSIONS_PENDING'
  | 'BELOW_MINIMUM';

export interface CertificateEligibility {
  activityId: number;
  sessionsTotal: number;
  sessionsPresent: number;
  attendancePercentage: number;
  minimumAttendancePercentage: number;
  sessionsPending: number;
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
      relations: { activity: { organizer: true }, user: true },
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
          organizerName:
            `${certificate.activity.organizer.firstName} ${certificate.activity.organizer.lastName}`.trim(),
          activityDate: certificate.activity.date,
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
    if (this.countPendingSessions(sessions) > 0) {
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
    } else if (this.countPendingSessions(sessions) > 0) {
      reason = 'SESSIONS_PENDING';
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
      sessionsPending: this.countPendingSessions(sessions),
      eligible: reason === undefined,
      ...(reason ? { reason } : {}),
    };
  }

  private countPendingSessions(
    sessions: SessionEntity[],
    now: Date = new Date(),
  ): number {
    return sessions.filter(
      (session) =>
        !hasSessionEndElapsed(session.sessionDate, session.endTime, now),
    ).length;
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
    organizerName: string;
    activityDate: string;
    certificateCode: string;
    issueDate: Date;
  }): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const document = this.createPdfDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 0,
      });
      const chunks: Buffer[] = [];

      document.on('data', (chunk: Buffer) => chunks.push(chunk));
      document.on('error', reject);
      document.on('end', () => resolve(Buffer.concat(chunks)));

      const { width, height } = document.page;
      const center = width / 2;
      const dateOnly = new Date(`${data.activityDate}T12:00:00.000Z`);
      const activityDate = new Intl.DateTimeFormat('es-CO', {
        dateStyle: 'long',
        timeZone: 'UTC',
      }).format(dateOnly);
      const issueDate = new Intl.DateTimeFormat('es-CO', {
        dateStyle: 'long',
        timeZone: 'America/Bogota',
      }).format(data.issueDate);

      document.rect(0, 0, width, height).fill(CERTIFICATE_COLORS.ivory);
      document
        .lineWidth(1.5)
        .strokeColor(CERTIFICATE_COLORS.navy)
        .rect(20, 20, width - 40, height - 40)
        .stroke();
      document
        .lineWidth(0.7)
        .strokeColor(CERTIFICATE_COLORS.gold)
        .rect(27, 27, width - 54, height - 54)
        .stroke();

      document
        .circle(center, 67, 20)
        .fill(CERTIFICATE_COLORS.navy);
      document
        .circle(center, 67, 15)
        .lineWidth(1)
        .strokeColor(CERTIFICATE_COLORS.gold)
        .stroke();
      document
        .font('Times-Bold')
        .fontSize(21)
        .fillColor(CERTIFICATE_COLORS.white)
        .text('K', center - 10, 54, { width: 20, align: 'center' });
      document
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor(CERTIFICATE_COLORS.navy)
        .text('KOOLER', center - 50, 92, { width: 100, align: 'center' });

      document
        .font('Helvetica-Bold')
        .fontSize(19)
        .fillColor(CERTIFICATE_COLORS.navy)
        .text('CERTIFICADO DE PARTICIPACIÓN', 68, 119, {
          width: width - 136,
          align: 'center',
          characterSpacing: 1.5,
        });
      document
        .moveTo(center - 100, 150)
        .lineTo(center + 100, 150)
        .lineWidth(1.2)
        .strokeColor(CERTIFICATE_COLORS.gold)
        .stroke();

      document
        .font('Times-Roman')
        .fontSize(13)
        .fillColor(CERTIFICATE_COLORS.muted)
        .text('Se otorga el presente certificado a', 68, 169, {
          width: width - 136,
          align: 'center',
        });
      drawFittedText(document, data.studentName, {
        x: 70,
        y: 193,
        width: width - 140,
        height: 54,
        font: 'Times-Bold',
        maxFontSize: 34,
        minFontSize: 13,
        color: CERTIFICATE_COLORS.blue,
      });
      document
        .font('Times-Roman')
        .fontSize(13)
        .fillColor(CERTIFICATE_COLORS.muted)
        .text('por su participación en', 68, 255, {
          width: width - 136,
          align: 'center',
        });
      drawFittedText(document, data.activityName, {
        x: 85,
        y: 278,
        width: width - 170,
        height: 64,
        font: 'Times-Bold',
        maxFontSize: 25,
        minFontSize: 12,
        color: CERTIFICATE_COLORS.navy,
      });

      const detailsTop = 377;
      const detailWidth = 205;
      const detailColumns = [
        { x: 74, label: 'ORGANIZADOR', value: data.organizerName },
        { x: center - detailWidth / 2, label: 'FECHA DE REALIZACIÓN', value: activityDate },
        { x: width - 74 - detailWidth, label: 'FECHA DE EMISIÓN', value: issueDate },
      ];
      for (const detail of detailColumns) {
        document
          .font('Helvetica-Bold')
          .fontSize(8)
          .fillColor(CERTIFICATE_COLORS.gold)
          .text(detail.label, detail.x, detailsTop, {
            width: detailWidth,
            align: 'center',
            characterSpacing: 0.8,
          });
        drawFittedText(document, detail.value, {
          x: detail.x,
          y: detailsTop + 16,
          width: detailWidth,
          height: 50,
          font: 'Helvetica',
          maxFontSize: 11,
          minFontSize: 8,
          color: CERTIFICATE_COLORS.ink,
        });
      }

      document
        .lineWidth(0.8)
        .strokeColor(CERTIFICATE_COLORS.gold)
        .moveTo(74, 452)
        .lineTo(width - 74, 452)
        .stroke();
      document
        .font('Helvetica-Bold')
        .fontSize(8)
        .fillColor(CERTIFICATE_COLORS.muted)
        .text('CÓDIGO ÚNICO', 74, 470, {
          width: width - 148,
          align: 'center',
          characterSpacing: 1,
        })
        .font('Courier')
        .fontSize(10)
        .fillColor(CERTIFICATE_COLORS.navy)
        .text(data.certificateCode, 74, 485, {
          width: width - 148,
          align: 'center',
        });

      document
        .circle(width - 84, height - 83, 37)
        .lineWidth(1.2)
        .strokeColor(CERTIFICATE_COLORS.blue)
        .stroke();
      document
        .circle(width - 84, height - 83, 31)
        .lineWidth(0.7)
        .strokeColor(CERTIFICATE_COLORS.gold)
        .stroke();
      document
        .font('Times-Bold')
        .fontSize(20)
        .fillColor(CERTIFICATE_COLORS.blue)
        .text('K', width - 95, height - 100, { width: 22, align: 'center' })
        .font('Helvetica-Bold')
        .fontSize(5.5)
        .fillColor(CERTIFICATE_COLORS.muted)
        .text('KOOLER', width - 112, height - 77, {
          width: 56,
          align: 'center',
          characterSpacing: 0.8,
        })
        .font('Helvetica')
        .fontSize(5)
        .text('PARTICIPACIÓN', width - 112, height - 67, {
          width: 56,
          align: 'center',
        });

      document.end();
    });
  }
}
