import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { ActivitiesService } from '../activities/activities.service';
import { SessionEntity } from '../activities/entities/session.entity';
import { UsersService } from '../users/users.service';
import { AttendanceEntity } from './entities/attendance.entity';

type AttendanceStatus = AttendanceEntity['status'];

@Injectable()
export class AttendanceService {
  constructor(
    private readonly usersService: UsersService,
    private readonly activitiesService: ActivitiesService,
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

    try {
      return await this.attendanceRepository.save(attendance);
    } catch (error) {
      if (this.isDuplicateAttendanceError(error)) {
        throw new ConflictException(
          'La asistencia del estudiante para esta sesión ya está registrada',
        );
      }
      throw error;
    }
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
