import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';
import { ActivitiesService } from './activities.service';
import { ActivityEntity } from './entities/activity.entity';
import { EnrollmentEntity } from './entities/enrollment.entity';
import { SessionEntity } from './entities/session.entity';
import { UserEntity } from '../users/entities/user.entity';
import { CatalogService } from '../catalog/catalog.service';
import { DataSource } from 'typeorm';

describe('ActivitiesService (Persona N)', () => {
  let service: ActivitiesService;
  let activityRepo: any;
  let enrollmentRepo: any;
  let sessionRepo: any;
  let dataSource: any;
  const catalogService = {
    findActivityTypeById: vi.fn(),
    findLocationById: vi.fn(),
  };

  const mockOrganizer = { id: 1, email: 'organizador@icesi.edu.co' } as UserEntity;
  const mockOtherUser = { id: 99, email: 'otro@icesi.edu.co' } as UserEntity;
  const mockStudent = { id: 2, email: 'estudiante@icesi.edu.co' } as UserEntity;

  const mockActivity = {
    id: 10,
    name: 'Taller de Yoga',
    capacity: 2,
    status: 'ACTIVE',
    registrationDeadline: new Date(Date.now() + 86400000), // Mañana
    organizer: mockOrganizer,
    enrollments: [],
  } as unknown as ActivityEntity;

  afterEach(() => {
    vi.useRealTimers();
  });

  beforeEach(async () => {
    activityRepo = {
      create: vi.fn().mockImplementation((dto) => dto),
      save: vi.fn().mockImplementation((act) => Promise.resolve({ id: 10, ...act })),
      find: vi.fn(),
      findOne: vi.fn(),
    };

    enrollmentRepo = {
      create: vi.fn().mockImplementation((dto) => dto),
      save: vi.fn().mockImplementation((enr) => Promise.resolve({ id: 100, ...enr, enrollmentDate: new Date() })),
      find: vi.fn(),
      findOne: vi.fn(),
      count: vi.fn(),
    };

    sessionRepo = {
      create: vi.fn().mockImplementation((dto) => dto),
      save: vi.fn().mockImplementation((session) => Promise.resolve({ id: 7, ...session })),
      find: vi.fn(),
    };

    // La inscripción corre en transacción: el manager entrega los mismos
    // repositorios mockeados para mantener los tests sin BD real.
    dataSource = {
      transaction: vi.fn().mockImplementation(async (cb: any) =>
        cb({
          getRepository: (entity: any) =>
            entity === ActivityEntity ? activityRepo : enrollmentRepo,
        }),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivitiesService,
        { provide: getRepositoryToken(ActivityEntity), useValue: activityRepo },
        { provide: getRepositoryToken(EnrollmentEntity), useValue: enrollmentRepo },
        { provide: getRepositoryToken(SessionEntity), useValue: sessionRepo },
        { provide: CatalogService, useValue: catalogService },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<ActivitiesService>(ActivitiesService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  it('debe crear una actividad asignando el organizador y estado ACTIVE', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-12T08:54:23.083Z'));

    const result = await service.create(
      {
        name: 'Torneo de Ping Pong',
        description: 'Torneo universitario',
        date: '2026-11-12',
        startTime: '04:00',
        endTime: '05:00',
        capacity: 16,
        registrationDeadline: '2026-11-13T04:59:59Z',
      },
      mockOrganizer,
    );

    expect(result.name).toBe('Torneo de Ping Pong');
    expect(result.status).toBe('ACTIVE');
    expect(result.organizer).toBe(mockOrganizer);
  });

  it('debe lanzar ForbiddenException si un usuario no dueño intenta cancelar la actividad', async () => {
    activityRepo.findOne.mockResolvedValue(mockActivity);

    await expect(service.cancel(10, mockOtherUser)).rejects.toThrow(ForbiddenException);
  });

  // Estos casos protegen los límites de cupo y la inscripción única.
  it('debe inscribir exitosamente al estudiante si hay cupo y no está duplicado', async () => {
    activityRepo.findOne.mockResolvedValue(mockActivity);
    enrollmentRepo.findOne.mockResolvedValue(null); // No duplicado
    enrollmentRepo.count.mockResolvedValue(0); // 0 inscritos de 2

    const result = await service.enroll(10, mockStudent);
    expect(result.message).toBe('Inscripción realizada exitosamente');
    expect(result.activityId).toBe(10);
  });

  it('debe rechazar la inscripción si los cupos están agotados (capacity alcanzada)', async () => {
    activityRepo.findOne.mockResolvedValue(mockActivity);
    enrollmentRepo.findOne.mockResolvedValue(null);
    enrollmentRepo.count.mockResolvedValue(2); // 2 de 2 ocupados

    await expect(service.enroll(10, mockStudent)).rejects.toThrow(BadRequestException);
  });

  it('debe rechazar la inscripción si el estudiante ya está inscrito (duplicado)', async () => {
    activityRepo.findOne.mockResolvedValue(mockActivity);
    enrollmentRepo.findOne.mockResolvedValue({ id: 50 }); // Ya existe

    await expect(service.enroll(10, mockStudent)).rejects.toThrow(BadRequestException);
  });

  it('debe impedir reducir el cupo por debajo de los inscritos actuales', async () => {
    activityRepo.findOne.mockResolvedValue(mockActivity);
    enrollmentRepo.count.mockResolvedValue(5);

    await expect(service.update(10, { capacity: 3 }, mockOrganizer)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('does not allow manually finishing an activity before its Bogota end time', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-12T09:30:00.000Z'));
    const activity = {
      ...mockActivity,
      date: '2026-11-12',
      startTime: '04:00',
      endTime: '05:00',
    } as unknown as ActivityEntity;
    activityRepo.findOne.mockResolvedValue(activity);

    await expect(
      service.update(10, { status: 'FINISHED' }, mockOrganizer),
    ).rejects.toThrow(BadRequestException);
    expect(activityRepo.save).not.toHaveBeenCalled();

    vi.setSystemTime(new Date('2026-11-12T10:00:00.000Z'));
    await expect(
      service.update(10, { status: 'FINISHED' }, mockOrganizer),
    ).resolves.toMatchObject({ status: 'FINISHED' });
  });

  it('keeps a started activity active until its end time and repairs an early FINISHED status', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-12T09:30:00.000Z'));
    const activity = {
      ...mockActivity,
      status: 'FINISHED',
      date: '2026-11-12',
      startTime: '04:00',
      endTime: '05:00',
      registrationDeadline: new Date('2026-11-12T10:30:00.000Z'),
    } as unknown as ActivityEntity;
    activityRepo.findOne.mockResolvedValue(activity);
    enrollmentRepo.findOne.mockResolvedValue(null);
    enrollmentRepo.count.mockResolvedValue(0);

    const detail = await service.findOne(10);
    expect(detail.status).toBe('ACTIVE');
    expect(activityRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'ACTIVE' }),
    );

    await expect(service.enroll(10, mockStudent)).resolves.toMatchObject({
      message: 'Inscripción realizada exitosamente',
    });
    expect(activity.status).toBe('ACTIVE');
  });

  it('finalizes activities from previous Colombia-local dates', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-12T08:00:00.000Z'));
    const activity = {
      ...mockActivity,
      date: '2026-11-11',
      endTime: '23:59',
      enrollments: [],
    } as unknown as ActivityEntity;
    activityRepo.findOne.mockResolvedValue(activity);

    await expect(service.findOne(10)).resolves.toMatchObject({
      status: 'FINISHED',
    });
    expect(activityRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'FINISHED' }),
    );
  });

  // RF09 cubre el caso en que la hora ya terminó aunque el estado aún siga ACTIVE.
  it('debe tratar como finalizada (RF09) una actividad con horario ya pasado', async () => {
    const pastActivity = {
      ...mockActivity,
      date: '2020-01-01',
      startTime: '10:00',
      endTime: '12:00',
    } as unknown as ActivityEntity;
    activityRepo.findOne.mockResolvedValue(pastActivity);

    await expect(service.enroll(10, mockStudent)).rejects.toThrow(BadRequestException);
    expect(pastActivity.status).toBe('FINISHED');
  });

  it('uses the Bogota end time for listing and changes status only at the boundary', async () => {
    vi.useFakeTimers();
    const activity = {
      ...mockActivity,
      date: '2026-11-12',
      endTime: '06:00',
      enrollments: [],
    } as unknown as ActivityEntity;
    activityRepo.find.mockResolvedValue([activity]);

    vi.setSystemTime(new Date('2026-11-12T10:59:59.999Z'));
    const beforeEnd = await service.findAll();
    expect(beforeEnd[0].status).toBe('ACTIVE');

    vi.setSystemTime(new Date('2026-11-12T11:00:00.000Z'));
    const atEnd = await service.findAll();
    expect(atEnd[0].status).toBe('FINISHED');
  });

  it('compares same-day, next-day, and previous-day activities in Bogota local time', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-12T09:20:00.000Z'));
    activityRepo.find.mockResolvedValue([
      {
        ...mockActivity,
        date: '2026-11-12',
        startTime: '04:00',
        endTime: '05:00',
        enrollments: [],
      },
      {
        ...mockActivity,
        date: '2026-11-13',
        startTime: '12:00',
        endTime: '20:00',
        enrollments: [],
      },
      {
        ...mockActivity,
        date: '2026-11-11',
        startTime: '23:00',
        endTime: '23:59',
        enrollments: [],
      },
    ] as ActivityEntity[]);

    const activities = await service.findAll();

    expect(activities.map(({ status }) => status)).toEqual([
      'ACTIVE',
      'ACTIVE',
      'FINISHED',
    ]);
  });

  it('keeps end-time comparisons independent of the server timezone', async () => {
    vi.useFakeTimers();
    const activity = {
      ...mockActivity,
      date: '2026-11-12',
      endTime: '05:00',
      enrollments: [],
    } as unknown as ActivityEntity;
    activityRepo.find.mockResolvedValue([activity]);
    const originalTimezone = process.env.TZ;
    const statuses: string[] = [];

    try {
      for (const timezone of ['UTC', 'Asia/Tokyo']) {
        process.env.TZ = timezone;
        vi.setSystemTime(new Date('2026-11-12T09:59:59.999Z'));
        statuses.push((await service.findAll())[0].status);

        vi.setSystemTime(new Date('2026-11-12T10:00:00.000Z'));
        statuses.push((await service.findAll())[0].status);
      }
    } finally {
      if (originalTimezone === undefined) {
        delete process.env.TZ;
      } else {
        process.env.TZ = originalTimezone;
      }
    }

    expect(statuses).toEqual(['ACTIVE', 'FINISHED', 'ACTIVE', 'FINISHED']);
  });

  it('persists detail finalization at the Bogota end time, not before', async () => {
    vi.useFakeTimers();
    const activity = {
      ...mockActivity,
      date: '2026-11-12',
      endTime: '06:00',
      enrollments: [],
    } as unknown as ActivityEntity;
    activityRepo.findOne.mockResolvedValue(activity);

    vi.setSystemTime(new Date('2026-11-12T10:59:59.999Z'));
    const beforeEnd = await service.findOne(10);
    expect(beforeEnd.status).toBe('ACTIVE');
    expect(activityRepo.save).not.toHaveBeenCalled();

    vi.setSystemTime(new Date('2026-11-12T11:00:00.000Z'));
    const atEnd = await service.findOne(10);
    expect(atEnd.status).toBe('FINISHED');
    expect(activityRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'FINISHED' }),
    );
  });

  it('allows enrollment before the Bogota end time and rejects it at the boundary', async () => {
    vi.useFakeTimers();
    const activity = {
      ...mockActivity,
      date: '2026-11-12',
      endTime: '06:00',
      registrationDeadline: new Date('2026-11-12T12:00:00.000Z'),
    } as unknown as ActivityEntity;
    activityRepo.findOne.mockResolvedValue(activity);
    enrollmentRepo.findOne.mockResolvedValue(null);
    enrollmentRepo.count.mockResolvedValue(0);

    vi.setSystemTime(new Date('2026-11-12T10:59:59.999Z'));
    await expect(service.enroll(10, mockStudent)).resolves.toMatchObject({
      message: 'Inscripción realizada exitosamente',
    });
    expect(activity.status).toBe('ACTIVE');

    vi.setSystemTime(new Date('2026-11-12T11:00:00.000Z'));
    await expect(service.enroll(10, mockStudent)).rejects.toThrow(
      BadRequestException,
    );
    expect(activity.status).toBe('FINISHED');
  });

  // isStudentEnrolled: integrado desde la Funcionalidad 3 (Persona S) para que
  // AttendanceService pueda validar la inscripción antes de registrar asistencia.
  describe('isStudentEnrolled (Persona S)', () => {
    it('debe retornar true cuando el estudiante está inscrito', async () => {
      enrollmentRepo.findOne.mockResolvedValue({ id: 1 });

      await expect(service.isStudentEnrolled(10, 2)).resolves.toBe(true);
      expect(enrollmentRepo.findOne).toHaveBeenCalledWith({
        where: {
          activity: { id: 10 },
          user: { id: 2 },
        },
      });
    });

    it('debe retornar false cuando no existe inscripción', async () => {
      enrollmentRepo.findOne.mockResolvedValue(null);

      await expect(service.isStudentEnrolled(10, 2)).resolves.toBe(false);
    });

    it('debe propagar errores del repositorio', async () => {
      const repositoryError = new Error('Database unavailable');
      enrollmentRepo.findOne.mockRejectedValue(repositoryError);

      await expect(service.isStudentEnrolled(10, 2)).rejects.toBe(repositoryError);
    });
  });
});
