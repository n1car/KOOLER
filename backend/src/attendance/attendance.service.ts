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
import { ActivityEntity } from '../activities/entities/activity.entity';
import { UsersService } from '../users/users.service';
import { AttendanceEntity } from './entities/attendance.entity';

type AttendanceStatus = AttendanceEntity['status'];

@Injectable()
export class AttendanceService {
  constructor(
    private readonly usersService: UsersService,
    private readonly activitiesService: ActivitiesService,
    @InjectRepository(ActivityEntity)
    private readonly activitiesRepository: Repository<ActivityEntity>,
    @InjectRepository(AttendanceEntity)
    private readonly attendanceRepository: Repository<AttendanceEntity>,
  ) {}

  async recordAttendance(
    userId: number,
    activityId: number,
    status: string,
  ): Promise<AttendanceEntity> {
    if (!this.isAttendanceStatus(status)) {
      throw new BadRequestException('Estado de asistencia inválido');
    }

    const user = await this.usersService.findById(userId);
    if (user.role.name !== 'ESTUDIANTE') {
      throw new ForbiddenException(
        'Solo se puede registrar asistencia para estudiantes',
      );
    }

    const activity = await this.activitiesRepository.findOneBy({
      id: activityId,
    });
    if (!activity) {
      throw new NotFoundException(
        `Actividad con id ${activityId} no encontrada`,
      );
    }
    if (activity.status !== 'FINISHED') {
      throw new BadRequestException(
        'Solo se puede registrar asistencia en actividades finalizadas',
      );
    }

    const isEnrolled = await this.activitiesService.isStudentEnrolled(
      activityId,
      userId,
    );
    if (!isEnrolled) {
      throw new ForbiddenException(
        'El estudiante no está inscrito en esta actividad',
      );
    }

    const attendance = this.attendanceRepository.create({
      user,
      activity,
      status,
    });

    try {
      return await this.attendanceRepository.save(attendance);
    } catch (error) {
      if (this.isDuplicateAttendanceError(error)) {
        throw new ConflictException(
          'La asistencia del estudiante para esta actividad ya está registrada',
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
      driverError?.constraint === 'UQ_attendance_user_activity'
    );
  }
}
