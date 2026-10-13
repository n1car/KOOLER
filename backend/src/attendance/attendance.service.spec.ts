import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { QueryFailedError } from 'typeorm';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { ActivitiesService } from '../activities/activities.service';
import { ActivityEntity } from '../activities/entities/activity.entity';
import { UsersService } from '../users/users.service';
import { AttendanceEntity } from './entities/attendance.entity';
import { AttendanceService } from './attendance.service';

const createUser = (roleName = 'ESTUDIANTE') => ({
  id: 1,
  firstName: 'Ana',
  lastName: 'Estudiante',
  email: 'ana@example.com',
  passwordHash: 'hash',
  status: 'ACTIVE',
  role: { id: 1, name: roleName, users: [] },
  createdAt: new Date(),
});

const createActivity = (status: ActivityEntity['status'] = 'FINISHED') => ({
  id: 10,
  name: 'Taller',
  description: 'Taller de bienestar',
  date: '2026-10-01',
  startTime: '10:00',
  endTime: '11:00',
  capacity: 20,
  status,
  registrationDeadline: new Date('2026-09-30T23:59:59Z'),
  isCertifiable: true,
  minAttendancePercentage: 80,
  organizer: createUser('ORGANIZADOR'),
  createdAt: new Date(),
});

describe('AttendanceService', () => {
  let service: AttendanceService;
  let usersService: { findById: ReturnType<typeof vi.fn> };
  let activitiesService: { isStudentEnrolled: ReturnType<typeof vi.fn> };
  let activitiesRepository: { findOneBy: ReturnType<typeof vi.fn> };
  let attendanceRepository: {
    create: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    usersService = { findById: vi.fn() };
    activitiesService = { isStudentEnrolled: vi.fn() };
    activitiesRepository = { findOneBy: vi.fn() };
    activitiesService.isStudentEnrolled.mockResolvedValue(true);
    attendanceRepository = {
      create: vi.fn(),
      save: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        { provide: UsersService, useValue: usersService },
        { provide: ActivitiesService, useValue: activitiesService },
        {
          provide: getRepositoryToken(ActivityEntity),
          useValue: activitiesRepository,
        },
        {
          provide: getRepositoryToken(AttendanceEntity),
          useValue: attendanceRepository,
        },
      ],
    }).compile();

    service = module.get(AttendanceService);
  });

  it('registra asistencia para un estudiante en una actividad finalizada', async () => {
    const user = createUser();
    const activity = createActivity();
    const attendance = {
      id: 1,
      user,
      activity,
      registrationDate: new Date(),
      status: 'PRESENT',
    };
    usersService.findById.mockResolvedValue(user);
    activitiesRepository.findOneBy.mockResolvedValue(activity);
    attendanceRepository.create.mockReturnValue(attendance);
    attendanceRepository.save.mockResolvedValue(attendance);

    await expect(service.recordAttendance(1, 10, 'PRESENT')).resolves.toBe(
      attendance,
    );
    expect(activitiesService.isStudentEnrolled).toHaveBeenCalledWith(10, 1);
    expect(attendanceRepository.create).toHaveBeenCalledWith({
      user,
      activity,
      status: 'PRESENT',
    });
    expect(attendanceRepository.save).toHaveBeenCalledWith(attendance);
  });

  it('rechaza asistencia cuando el estudiante no está inscrito', async () => {
    usersService.findById.mockResolvedValue(createUser());
    activitiesRepository.findOneBy.mockResolvedValue(createActivity());
    activitiesService.isStudentEnrolled.mockResolvedValue(false);

    await expect(service.recordAttendance(1, 10, 'PRESENT')).rejects.toThrow(
      ForbiddenException,
    );
    expect(attendanceRepository.create).not.toHaveBeenCalled();
    expect(attendanceRepository.save).not.toHaveBeenCalled();
  });

  it('propaga errores al consultar la inscripción', async () => {
    const enrollmentError = new Error('Database unavailable');
    usersService.findById.mockResolvedValue(createUser());
    activitiesRepository.findOneBy.mockResolvedValue(createActivity());
    activitiesService.isStudentEnrolled.mockRejectedValue(enrollmentError);

    await expect(service.recordAttendance(1, 10, 'PRESENT')).rejects.toBe(
      enrollmentError,
    );
    expect(attendanceRepository.create).not.toHaveBeenCalled();
    expect(attendanceRepository.save).not.toHaveBeenCalled();
  });

  it('rechaza un estado de asistencia no soportado', async () => {
    await expect(service.recordAttendance(1, 10, 'UNKNOWN')).rejects.toThrow(
      BadRequestException,
    );
    expect(usersService.findById).not.toHaveBeenCalled();
  });

  it('rechaza un usuario que no sea estudiante', async () => {
    usersService.findById.mockResolvedValue(createUser('ORGANIZADOR'));

    await expect(service.recordAttendance(1, 10, 'PRESENT')).rejects.toThrow(
      ForbiddenException,
    );
    expect(activitiesRepository.findOneBy).not.toHaveBeenCalled();
  });

  it('propaga el error cuando el usuario solicitado no existe', async () => {
    const notFoundError = new NotFoundException('Usuario con id 1 no encontrado');
    usersService.findById.mockRejectedValue(notFoundError);

    await expect(service.recordAttendance(1, 10, 'PRESENT')).rejects.toBe(
      notFoundError,
    );
    expect(activitiesRepository.findOneBy).not.toHaveBeenCalled();
  });

  it('rechaza una actividad inexistente', async () => {
    usersService.findById.mockResolvedValue(createUser());
    activitiesRepository.findOneBy.mockResolvedValue(null);

    await expect(service.recordAttendance(1, 10, 'PRESENT')).rejects.toThrow(
      'Actividad con id 10 no encontrada',
    );
    expect(attendanceRepository.save).not.toHaveBeenCalled();
  });

  it('rechaza asistencia en una actividad no finalizada', async () => {
    usersService.findById.mockResolvedValue(createUser());
    activitiesRepository.findOneBy.mockResolvedValue(createActivity('ACTIVE'));

    await expect(service.recordAttendance(1, 10, 'PRESENT')).rejects.toThrow(
      BadRequestException,
    );
    expect(attendanceRepository.save).not.toHaveBeenCalled();
  });

  it('convierte la violación de unicidad estudiante-actividad en conflicto', async () => {
    const user = createUser();
    const activity = createActivity();
    usersService.findById.mockResolvedValue(user);
    activitiesRepository.findOneBy.mockResolvedValue(activity);
    attendanceRepository.create.mockReturnValue({});
    attendanceRepository.save.mockRejectedValue(
      new QueryFailedError('INSERT INTO attendances', [], {
        code: '23505',
        constraint: 'UQ_attendance_user_activity',
      }),
    );

    await expect(service.recordAttendance(1, 10, 'PRESENT')).rejects.toThrow(
      ConflictException,
    );
  });

  it('vuelve a propagar errores de persistencia no relacionados con duplicados', async () => {
    const user = createUser();
    const activity = createActivity();
    const persistenceError = new Error('Database unavailable');
    usersService.findById.mockResolvedValue(user);
    activitiesRepository.findOneBy.mockResolvedValue(activity);
    attendanceRepository.create.mockReturnValue({});
    attendanceRepository.save.mockRejectedValue(persistenceError);

    await expect(service.recordAttendance(1, 10, 'PRESENT')).rejects.toBe(
      persistenceError,
    );
  });
});
