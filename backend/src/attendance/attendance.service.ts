import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { ActivitiesService } from '../activities/activities.service';
import { SessionEntity } from '../activities/entities/session.entity';
import { CertificatesService } from '../certificates/certificates.service';
import { UsersService } from '../users/users.service';
import { AttendanceEntity } from './entities/attendance.entity';

type AttendanceStatus = AttendanceEntity['status'];

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly activitiesService: ActivitiesService,
    private readonly certificatesService: CertificatesService,
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>,
    @InjectRepository(AttendanceEntity)
    private readonly attendanceRepository: Repository<AttendanceEntity>,
  ) {}

  async recordAttendance(
    organizerId: number,
    studentId: number,
    activityId: number,
    sessionId: number,
    status: string,
  ): Promise<AttendanceEntity> {
    if (!this.isAttendanceStatus(status)) {
      throw new BadRequestException('Estado de asistencia inválido');
    }

    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: { activity: true },
    });
    if (!session) {
      throw new NotFoundException(`Sesión con id ${sessionId} no encontrada`);
    }

    const activity = session.activity;
    if (activity.id !== activityId) {
      throw new BadRequestException(
        'La sesión indicada no pertenece a la actividad especificada',
      );
    }

    if (activity.organizer.id !== organizerId) {
      throw new ForbiddenException(
        'Solo el organizador propietario puede registrar asistencia',
      );
    }

    const user = await this.usersService.findById(studentId);
    if (user.role.name !== 'ESTUDIANTE') {
      throw new ForbiddenException(
        'Solo se puede registrar asistencia para estudiantes',
      );
    }

    const isEnrolled = await this.activitiesService.isStudentEnrolled(
      activityId,
      studentId,
    );
    if (!isEnrolled) {
      throw new ForbiddenException(
        'El estudiante no está inscrito en esta actividad',
      );
    }
    if (activity.status !== 'FINISHED') {
      throw new BadRequestException(
        'Solo se puede registrar asistencia en actividades finalizadas',
      );
    }

    const attendance = this.attendanceRepository.create({
      user,
      session,
      status,
    });

    let saved: AttendanceEntity;
    try {
      saved = await this.attendanceRepository.save(attendance);
    } catch (error) {
      if (this.isDuplicateAttendanceError(error)) {
        throw new ConflictException(
          'La asistencia del estudiante para esta sesión ya está registrada',
        );
      }
      throw error;
    }

    // Emisión inmediata (idempotente): deja el certificado disponible sin
    // esperar el ciclo del cron. El cron sigue cubriendo reintentos.
    await this.tryIssueCertificates(activityId);

    return saved;
  }

  private async tryIssueCertificates(activityId: number): Promise<void> {
    try {
      await this.certificatesService.issueEligibleCertificates(activityId);
    } catch (error) {
      this.logger.warn(
        `No se pudieron emitir certificados de la actividad ${activityId} tras registrar asistencia; el cron reintentara`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  // Devuelve la asistencia registrada en una sesión (Solo Organizador Dueño).
  // Lo consume el panel admin para pintar el estado actual de cada estudiante.
  async getSessionAttendance(
    organizerId: number,
    activityId: number,
    sessionId: number,
  ) {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: { activity: true },
    });
    if (!session) {
      throw new NotFoundException(`Sesión con id ${sessionId} no encontrada`);
    }

    if (session.activity.id !== activityId) {
      throw new BadRequestException(
        'La sesión indicada no pertenece a la actividad especificada',
      );
    }

    if (session.activity.organizer.id !== organizerId) {
      throw new ForbiddenException(
        'Solo el organizador propietario puede consultar la asistencia',
      );
    }

    const records = await this.attendanceRepository.find({
      where: { session: { id: sessionId } },
      relations: { user: true },
      order: { registrationDate: 'ASC' },
    });

    return {
      activityId,
      sessionId,
      attendance: records.map((record) => ({
        studentId: record.user.id,
        firstName: record.user.firstName,
        lastName: record.user.lastName,
        status: record.status,
        registrationDate: record.registrationDate,
      })),
    };
  }

  private isAttendanceStatus(status: string): status is AttendanceStatus {
    return status === 'PRESENT' || status === 'ABSENT';
  }

  private isDuplicateAttendanceError(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) {
      return false;
    }

    const driverError = error.driverError;
    return (
      driverError?.code === '23505' &&
      driverError?.constraint === 'UQ_attendance_user_session'
    );
  }
}
