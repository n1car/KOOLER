import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, Repository } from 'typeorm';
import { ActivityEntity } from './entities/activity.entity';
import { EnrollmentEntity } from './entities/enrollment.entity';
import { SessionEntity } from './entities/session.entity';
import { UserEntity } from '../users/entities/user.entity';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { FilterActivitiesDto } from './dto/filter-activities.dto';
import { CreateSessionDto } from './dto/create-session.dto';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(ActivityEntity)
    private readonly activityRepo: Repository<ActivityEntity>,

    @InjectRepository(EnrollmentEntity)
    private readonly enrollmentRepo: Repository<EnrollmentEntity>,

    @InjectRepository(SessionEntity)
    private readonly sessionRepo: Repository<SessionEntity>,

    private readonly dataSource: DataSource,
  ) {}

  // RF09: una actividad pasa a FINISHED cuando ya pasó su horario.
  // Se evalúa por fecha+hora de fin para no depender de un cron en D2.
  private isPastEnd(activity: ActivityEntity, now: Date = new Date()): boolean {
    if (!activity.date || !activity.endTime) return false;
    const end = new Date(`${activity.date}T${activity.endTime}`);
    if (Number.isNaN(end.getTime())) return false;
    return now >= end;
  }

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
      // RF09: reflejar FINISHED aunque el cron aún no haya persistido el cambio.
      const status = act.status === 'ACTIVE' && this.isPastEnd(act) ? 'FINISHED' : act.status;
      const { enrollments: _ignored, ...data } = act;

      return {
        ...data,
        status,
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
    // RF09: persistir la transición ACTIVE -> FINISHED al consultar el detalle.
    if (activity.status === 'ACTIVE' && this.isPastEnd(activity)) {
      activity.status = 'FINISHED';
      await this.activityRepo.save(activity);
    }
    const { enrollments: _ignored, ...data } = activity;

    return {
      ...data,
      status: activity.status,
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

    // Regla de negocio: no reducir el cupo por debajo de los ya inscritos.
    if (updateDto.capacity !== undefined) {
      const enrolledCount = await this.enrollmentRepo.count({
        where: { activity: { id } },
      });
      if (updateDto.capacity < enrolledCount) {
        throw new BadRequestException(
          `No se puede reducir el cupo a ${updateDto.capacity}: ya hay ${enrolledCount} inscritos`,
        );
      }
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
  // RNF07: todo el chequeo+inserción corre dentro de una transacción con
  // bloqueo pesimista de la fila de actividad para evitar sobrecupo concurrente.
  async enroll(activityId: number, student: UserEntity) {
    return this.dataSource.transaction(async (manager) => {
      const activityRepo = manager.getRepository(ActivityEntity);
      const enrollmentRepo = manager.getRepository(EnrollmentEntity);

      // Postgres no permite FOR UPDATE con LEFT JOIN: se bloquea solo la
      // fila de la actividad (sin relations) y el conteo va por query aparte.
      const activity = await activityRepo.findOne({
        where: { id: activityId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!activity) {
        throw new NotFoundException(`Actividad con ID ${activityId} no encontrada`);
      }

      // RF09: si ya pasó el horario, tratarla como finalizada aunque el
      // estado persistido siga en ACTIVE.
      if (activity.status === 'ACTIVE' && this.isPastEnd(activity)) {
        activity.status = 'FINISHED';
        await activityRepo.save(activity);
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
      const alreadyEnrolled = await enrollmentRepo.findOne({
        where: {
          activity: { id: activityId },
          user: { id: student.id },
        },
      });

      if (alreadyEnrolled) {
        throw new BadRequestException('Ya te encuentras inscrito en esta actividad');
      }

      // Regla 4: Inscritos no pueden superar capacity
      const currentEnrolledCount = await enrollmentRepo.count({
        where: { activity: { id: activityId } },
      });

      if (currentEnrolledCount >= activity.capacity) {
        throw new BadRequestException('No hay cupos disponibles para esta actividad');
      }

      // Crear y guardar la inscripción
      const enrollment = enrollmentRepo.create({
        activity,
        user: student,
      });

      const saved = await enrollmentRepo.save(enrollment);

      return {
        message: 'Inscripción realizada exitosamente',
        enrollmentId: saved.id,
        activityId: activity.id,
        activityName: activity.name,
        enrollmentDate: saved.enrollmentDate,
      };
    });
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

  // 9. Crear una sesión dentro de una actividad (Solo Organizador Dueño).
  // Las sesiones habilitan el registro de asistencia y el cálculo de certificados.
  async createSession(
    activityId: number,
    dto: CreateSessionDto,
    user: UserEntity,
  ): Promise<SessionEntity> {
    const activity = await this.activityRepo.findOne({
      where: { id: activityId },
      relations: { organizer: true },
    });

    if (!activity) {
      throw new NotFoundException(`Actividad con ID ${activityId} no encontrada`);
    }

    if (activity.organizer.id !== user.id) {
      throw new ForbiddenException('Solo el organizador responsable puede crear sesiones');
    }

    const session = this.sessionRepo.create({
      activity,
      sessionDate: dto.sessionDate,
      startTime: dto.startTime,
      endTime: dto.endTime,
    });

    return this.sessionRepo.save(session);
  }

  // 10. Listar las sesiones de una actividad (público).
  async getSessions(activityId: number): Promise<SessionEntity[]> {
    const activity = await this.activityRepo.findOne({ where: { id: activityId } });

    if (!activity) {
      throw new NotFoundException(`Actividad con ID ${activityId} no encontrada`);
    }

    return this.sessionRepo.find({
      where: { activity: { id: activityId } },
      order: { sessionDate: 'ASC', startTime: 'ASC' },
    });
  }

  // 11. Verificar si un estudiante está inscrito en una actividad.
  // Usado por AttendanceService (Funcionalidad 3) antes de registrar asistencia.
  async isStudentEnrolled(
    activityId: number,
    studentId: number,
  ): Promise<boolean> {
    const enrollment = await this.enrollmentRepo.findOne({
      where: {
        activity: { id: activityId },
        user: { id: studentId },
      },
    });

    return enrollment !== null;
  }
}
