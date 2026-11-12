import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
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
import { CatalogService } from '../catalog/catalog.service';

const ACTIVITY_TIME_ZONE = 'America/Bogota';
const ACTIVITY_LOCAL_TIME_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: ACTIVITY_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  fractionalSecondDigits: 3,
  hourCycle: 'h23',
});

@Injectable()
export class ActivitiesService {
  private readonly logger = new Logger(ActivitiesService.name);

  constructor(
    @InjectRepository(ActivityEntity)
    private readonly activityRepo: Repository<ActivityEntity>,

    @InjectRepository(EnrollmentEntity)
    private readonly enrollmentRepo: Repository<EnrollmentEntity>,

    @InjectRepository(SessionEntity)
    private readonly sessionRepo: Repository<SessionEntity>,

    private readonly catalogService: CatalogService,

    private readonly dataSource: DataSource,
  ) {}

  private traceStatus(
    origin: string,
    activity: Pick<ActivityEntity, 'id' | 'date' | 'endTime'>,
    previousStatus: ActivityEntity['status'] | null,
    nextStatus: ActivityEntity['status'],
    outcome: 'persisted' | 'response-only' | 'rejected',
  ): void {
    const now = new Date();
    this.logger.warn(
      `[STATUS_TRACE] ${JSON.stringify({
        origin,
        outcome,
        activityId: activity.id,
        previousStatus,
        nextStatus,
        date: activity.date,
        endTime: activity.endTime,
        utcNow: now.toISOString(),
        colombiaNow: ACTIVITY_LOCAL_TIME_FORMATTER.format(now),
        processTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })}`,
    );
  }

  // RF09: una actividad pasa a FINISHED cuando ya pasó su horario.
  // Se evalúa por fecha+hora de fin para no depender de un cron en D2.
  private getLocalEnd(activity: Pick<ActivityEntity, 'date' | 'endTime'>): string | null {
    const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(activity.date);
    const timeMatch =
      /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/.exec(activity.endTime);
    if (!dateMatch || !timeMatch) return null;

    const [, yearValue, monthValue, dayValue] = dateMatch;
    const year = Number(yearValue);
    const month = Number(monthValue);
    const day = Number(dayValue);
    const calendarDate = new Date(Date.UTC(year, month - 1, day));
    if (
      calendarDate.getUTCFullYear() !== year ||
      calendarDate.getUTCMonth() !== month - 1 ||
      calendarDate.getUTCDate() !== day
    ) {
      return null;
    }

    const [, hour, minute, second = '00'] = timeMatch;
    return `${activity.date}T${hour}:${minute}:${second}.000`;
  }

  private isPastEnd(
    activity: Pick<ActivityEntity, 'date' | 'endTime'>,
    now: Date = new Date(),
  ): boolean {
    const localEnd = this.getLocalEnd(activity);
    if (!localEnd) return false;

    const localNowParts = Object.fromEntries(
      ACTIVITY_LOCAL_TIME_FORMATTER.formatToParts(now).map(({ type, value }) => [
        type,
        value,
      ]),
    );
    const localNow =
      `${localNowParts.year}-${localNowParts.month}-${localNowParts.day}` +
      `T${localNowParts.hour}:${localNowParts.minute}:${localNowParts.second}` +
      `.${localNowParts.fractionalSecond}`;

    return localNow >= localEnd;
  }

  private statusForSchedule(
    activity: Pick<ActivityEntity, 'date' | 'endTime'>,
    currentStatus: ActivityEntity['status'],
  ): ActivityEntity['status'] {
    if (currentStatus === 'CANCELLED') return currentStatus;
    if (!this.getLocalEnd(activity)) return currentStatus;
    return this.isPastEnd(activity) ? 'FINISHED' : 'ACTIVE';
  }

  // Evita exponer el hash de contraseña del organizador en respuestas públicas.
  private toPublicOrganizer(organizer: UserEntity) {
    return {
      id: organizer.id,
      firstName: organizer.firstName,
      lastName: organizer.lastName,
      email: organizer.email,
      status: organizer.status,
    };
  }

  // La sesión carga su actividad (y el organizador) de forma eager; se
  // devuelve solo lo necesario para no filtrar datos del usuario.
  private toPublicSession(session: SessionEntity) {
    return {
      id: session.id,
      activityId: session.activity?.id,
      sessionDate: session.sessionDate,
      startTime: session.startTime ?? null,
      endTime: session.endTime ?? null,
      createdAt: session.createdAt,
    };
  }

  // 1. Crear actividad (Solo Organizador)
  async create(createDto: CreateActivityDto, organizer: UserEntity): Promise<ActivityEntity> {
    const { activityTypeId, locationId, ...rest } = createDto;

    const activity = this.activityRepo.create({
      ...rest,
      organizer,
      status: 'ACTIVE',
      registrationDeadline: new Date(createDto.registrationDeadline),
    });

    if (activityTypeId !== undefined) {
      activity.activityType = await this.catalogService.findActivityTypeById(activityTypeId);
    }
    if (locationId !== undefined) {
      activity.location = await this.catalogService.findLocationById(locationId);
    }

    const saved = await this.activityRepo.save(activity);
    this.traceStatus('ActivitiesService.create', saved, null, saved.status, 'persisted');
    return saved;
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

    if (filter?.activityTypeId) {
      where.activityType = { id: filter.activityTypeId };
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
      const status = this.statusForSchedule(act, act.status);
      if (status !== act.status) {
        this.traceStatus(
          'ActivitiesService.findAll',
          act,
          act.status,
          status,
          'response-only',
        );
      }
      const { enrollments: _ignored, ...data } = act;

      return {
        ...data,
        organizer: this.toPublicOrganizer(act.organizer),
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
    // Reconcile legacy statuses against Colombia-local end time.
    const status = this.statusForSchedule(activity, activity.status);
    if (activity.status !== status) {
      this.traceStatus(
        'ActivitiesService.findOne',
        activity,
        activity.status,
        status,
        'persisted',
      );
      activity.status = status;
      await this.activityRepo.save(activity);
    }
    const { enrollments: _ignored, ...data } = activity;

    return {
      ...data,
      organizer: this.toPublicOrganizer(activity.organizer),
      status,
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

    const { activityTypeId, locationId, registrationDeadline, ...rest } = updateDto;

    if (rest.status === 'FINISHED') {
      const scheduledEnd = {
        date: rest.date ?? activity.date,
        endTime: rest.endTime ?? activity.endTime,
      };
      if (!this.isPastEnd(scheduledEnd)) {
        this.traceStatus(
          'ActivitiesService.update',
          activity,
          activity.status,
          'FINISHED',
          'rejected',
        );
        throw new BadRequestException(
          'No se puede finalizar la actividad antes de su hora de finalización en Colombia',
        );
      }
    }

    // Regla de negocio: no reducir el cupo por debajo de los ya inscritos.
    if (rest.capacity !== undefined) {
      const enrolledCount = await this.enrollmentRepo.count({
        where: { activity: { id } },
      });
      if (rest.capacity < enrolledCount) {
        throw new BadRequestException(
          `No se puede reducir el cupo a ${rest.capacity}: ya hay ${enrolledCount} inscritos`,
        );
      }
    }

    if (registrationDeadline) {
      activity.registrationDeadline = new Date(registrationDeadline);
    }

    if (activityTypeId !== undefined) {
      activity.activityType = await this.catalogService.findActivityTypeById(activityTypeId);
    }

    if (locationId !== undefined) {
      activity.location = await this.catalogService.findLocationById(locationId);
    }

    const previousStatus = activity.status;
    Object.assign(activity, rest);
    if (activity.status !== previousStatus) {
      this.traceStatus(
        'ActivitiesService.update',
        activity,
        previousStatus,
        activity.status,
        'persisted',
      );
    }
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

    const previousStatus = activity.status;
    activity.status = 'CANCELLED';
    this.traceStatus(
      'ActivitiesService.cancel',
      activity,
      previousStatus,
      activity.status,
      'persisted',
    );
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
      // fila de la actividad (sin relations ni eager) y el conteo va por query aparte.
      const activity = await activityRepo.findOne({
        where: { id: activityId },
        lock: { mode: 'pessimistic_write' },
        loadEagerRelations: false,
      });

      if (!activity) {
        throw new NotFoundException(`Actividad con ID ${activityId} no encontrada`);
      }

      // Reconcile legacy statuses before applying the enrollment rules.
      const status = this.statusForSchedule(activity, activity.status);
      if (activity.status !== status) {
        this.traceStatus(
          'ActivitiesService.enroll',
          activity,
          activity.status,
          status,
          'persisted',
        );
        activity.status = status;
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
        isCertifiable: e.activity.isCertifiable,
        category: e.activity.activityType?.name ?? null,
        location: e.activity.location?.name ?? null,
      },
    }));
  }

  // 9. Crear una sesión dentro de una actividad (Solo Organizador Dueño).
  // Las sesiones habilitan el registro de asistencia y el cálculo de certificados.
  async createSession(
    activityId: number,
    dto: CreateSessionDto,
    user: UserEntity,
  ) {
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

    const saved = await this.sessionRepo.save(session);
    return this.toPublicSession(saved);
  }

  // 10. Listar las sesiones de una actividad (público).
  async getSessions(activityId: number) {
    const activity = await this.activityRepo.findOne({ where: { id: activityId } });

    if (!activity) {
      throw new NotFoundException(`Actividad con ID ${activityId} no encontrada`);
    }

    const sessions = await this.sessionRepo.find({
      where: { activity: { id: activityId } },
      order: { sessionDate: 'ASC', startTime: 'ASC' },
    });

    return sessions.map((session) => this.toPublicSession(session));
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
