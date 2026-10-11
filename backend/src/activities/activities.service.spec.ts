import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { ActivitiesService } from './activities.service';
import { ActivityEntity } from './entities/activity.entity';
import { EnrollmentEntity } from './entities/enrollment.entity';
import { UserEntity } from '../users/entities/user.entity';

describe('ActivitiesService (Persona N)', () => {
  let service: ActivitiesService;
  let activityRepo: any;
  let enrollmentRepo: any;

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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivitiesService,
        { provide: getRepositoryToken(ActivityEntity), useValue: activityRepo },
        { provide: getRepositoryToken(EnrollmentEntity), useValue: enrollmentRepo },
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
});
