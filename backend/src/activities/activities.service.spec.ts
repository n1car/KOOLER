import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { describe, beforeEach, it, expect, vi } from 'vitest';
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
    const result = await service.create(
      {
        name: 'Torneo de Ping Pong',
        description: 'Torneo universitario',
        date: '2026-10-20',
        startTime: '10:00',
        endTime: '12:00',
        capacity: 16,
        registrationDeadline: '2026-10-19T23:59:59Z',
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
