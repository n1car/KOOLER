import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { ActivityEntity } from './entities/activity.entity';
import { EnrollmentEntity } from './entities/enrollment.entity';
import { UserEntity } from '../users/entities/user.entity';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { FilterActivitiesDto } from './dto/filter-activities.dto';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(ActivityEntity)
    private readonly activityRepo: Repository<ActivityEntity>,

    @InjectRepository(EnrollmentEntity)
    private readonly enrollmentRepo: Repository<EnrollmentEntity>,
  ) {}

  // 1. Crear actividad (Solo Organizador)
  async create(createDto: CreateActivityDto, organizer: UserEntity): Promise<ActivityEntity> {
    const activity = this.activityRepo.create({
      ...createDto,
      organizer,
      status: 'ACTIVE',
      registrationDeadline: new Date(createDto.registrationDeadline),
    });

    return this.activityRepo.save(activity);
  }

  // 2. Listar actividades con filtros y cupos calculados
  async findAll(filter?: FilterActivitiesDto) {
    const where: any = {};

    if (filter?.status) {
      where.status = filter.status;
    }

    if (filter?.search) {
      where.name = ILike(`%${filter.search}%`);
    }

    const activities = await this.activityRepo.find({
      where,
      relations: { organizer: true, enrollments: true },
      order: { date: 'ASC', startTime: 'ASC' },
    });

    return activities.map((act) => {
      const enrolledCount = act.enrollments ? act.enrollments.length : 0;
      const availableSpots = Math.max(0, act.capacity - enrolledCount);
      const { enrollments, ...data } = act;

      return {
        ...data,
        enrolledCount,
        availableSpots,
      };
    });
  }

  // 3. Detalle de actividad con cupos calculados
  async findOne(id: number) {
    const activity = await this.activityRepo.findOne({
      where: { id },
      relations: { organizer: true, enrollments: true },
    });

    if (!activity) {
      throw new NotFoundException(`Actividad con ID ${id} no encontrada`);
    }

    const enrolledCount = activity.enrollments ? activity.enrollments.length : 0;
    const availableSpots = Math.max(0, activity.capacity - enrolledCount);
    const { enrollments, ...data } = activity;

    return {
      ...data,
      enrolledCount,
      availableSpots,
    };
  }

  // 4. Modificar actividad (Solo Organizador Dueño)
  async update(id: number, updateDto: UpdateActivityDto, user: UserEntity) {
    const activity = await this.activityRepo.findOne({
      where: { id },
      relations: { organizer: true },
    });

    if (!activity) {
      throw new NotFoundException(`Actividad con ID ${id} no encontrada`);
    }

    // Regla de negocio: Solo el organizador dueño puede modificar
    if (activity.organizer.id !== user.id) {
      throw new ForbiddenException('Solo el organizador responsable puede modificar esta actividad');
    }

    if (updateDto.registrationDeadline) {
      activity.registrationDeadline = new Date(updateDto.registrationDeadline);
      delete updateDto.registrationDeadline;
    }

    Object.assign(activity, updateDto);
    return this.activityRepo.save(activity);
  }

  // 5. Cancelar actividad (Soft cancel por el dueño)
  async cancel(id: number, user: UserEntity) {
    const activity = await this.activityRepo.findOne({
      where: { id },
      relations: { organizer: true },
    });

    if (!activity) {
      throw new NotFoundException(`Actividad con ID ${id} no encontrada`);
    }

    // Regla de negocio: Solo el organizador dueño puede cancelar
    if (activity.organizer.id !== user.id) {
      throw new ForbiddenException('Solo el organizador responsable puede cancelar esta actividad');
    }

    activity.status = 'CANCELLED';
    await this.activityRepo.save(activity);

    return {
      message: 'Actividad cancelada exitosamente',
      id: activity.id,
      status: activity.status,
    };
  }

  // 6. Inscribir estudiante a actividad (Reglas estrictas de negocio)
  async enroll(activityId: number, student: UserEntity) {
    const activity = await this.activityRepo.findOne({
      where: { id: activityId },
      relations: { enrollments: true },
    });

    if (!activity) {
      throw new NotFoundException(`Actividad con ID ${activityId} no encontrada`);
    }

    // Regla 1: Solo actividades en estado ACTIVE permiten inscripción
    if (activity.status !== 'ACTIVE') {
      throw new BadRequestException('No es posible inscribirse: la actividad no está activa');
    }

    // Regla 2: No se permite inscripción después de registration_deadline
    const now = new Date();
    if (now > new Date(activity.registrationDeadline)) {
      throw new BadRequestException('El plazo de inscripción para esta actividad ya finalizó');
    }

    // Regla 3: Un estudiante no puede inscribirse dos veces en la misma actividad
    const alreadyEnrolled = await this.enrollmentRepo.findOne({
      where: {
        activity: { id: activityId },
        user: { id: student.id },
      },
    });

    if (alreadyEnrolled) {
      throw new BadRequestException('Ya te encuentras inscrito en esta actividad');
    }

    // Regla 4: Inscritos no pueden superar capacity
    const currentEnrolledCount = await this.enrollmentRepo.count({
      where: { activity: { id: activityId } },
    });

    if (currentEnrolledCount >= activity.capacity) {
      throw new BadRequestException('No hay cupos disponibles para esta actividad');
    }

    // Crear y guardar la inscripción
    const enrollment = this.enrollmentRepo.create({
      activity,
      user: student,
    });

    const saved = await this.enrollmentRepo.save(enrollment);

    return {
      message: 'Inscripción realizada exitosamente',
      enrollmentId: saved.id,
      activityId: activity.id,
      activityName: activity.name,
      enrollmentDate: saved.enrollmentDate,
    };
  }

  // 7. Consultar estudiantes inscritos (Solo Organizador Dueño)
  async getEnrollments(activityId: number, user: UserEntity) {
    const activity = await this.activityRepo.findOne({
      where: { id: activityId },
      relations: { organizer: true },
    });

    if (!activity) {
      throw new NotFoundException(`Actividad con ID ${activityId} no encontrada`);
    }

    // Regla de negocio: Solo el organizador dueño puede ver los inscritos
    if (activity.organizer.id !== user.id) {
      throw new ForbiddenException('Solo el organizador responsable puede ver los inscritos');
    }

    const enrollments = await this.enrollmentRepo.find({
      where: { activity: { id: activityId } },
      relations: { user: true },
      order: { enrollmentDate: 'ASC' },
    });

    return {
      activityId: activity.id,
      activityName: activity.name,
      totalEnrolled: enrollments.length,
      capacity: activity.capacity,
      enrollments: enrollments.map((e) => ({
        enrollmentId: e.id,
        enrollmentDate: e.enrollmentDate,
        student: {
          id: e.user.id,
          firstName: e.user.firstName,
          lastName: e.user.lastName,
          email: e.user.email,
        },
      })),
    };
  }

  // 8. Consultar inscripciones del estudiante conectado ("Mis Inscripciones")
  async getMyEnrollments(student: UserEntity) {
    const enrollments = await this.enrollmentRepo.find({
      where: { user: { id: student.id } },
      relations: { activity: true },
      order: { enrollmentDate: 'DESC' },
    });

    return enrollments.map((e) => ({
      enrollmentId: e.id,
      enrollmentDate: e.enrollmentDate,
      activity: {
        id: e.activity.id,
        name: e.activity.name,
        date: e.activity.date,
        startTime: e.activity.startTime,
        endTime: e.activity.endTime,
        status: e.activity.status,
        imageUrl: e.activity.imageUrl,
      },
    }));
  }
}
