import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { QueryFailedError } from 'typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ActivitiesService } from '../activities/activities.service';
import { ActivityEntity } from '../activities/entities/activity.entity';
import { SessionEntity } from '../activities/entities/session.entity';
import { CertificatesService } from '../certificates/certificates.service';
import { UsersService } from '../users/users.service';
import { AttendanceEntity } from './entities/attendance.entity';
import { AttendanceService } from './attendance.service';

const createUser = (roleName = 'ESTUDIANTE', id = 1) => ({
  id,
  firstName: 'Ana',
  lastName: 'Estudiante',
  email: 'ana@example.com',
  passwordHash: 'hash',
  status: 'ACTIVE',
  role: { id: 1, name: roleName, users: [] },
  createdAt: new Date(),
});

const createActivity = (
  status: ActivityEntity['status'] = 'FINISHED',
  organizerId = 20,
) => ({
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
  organizer: createUser('ORGANIZADOR', organizerId),
  createdAt: new Date(),
});

const createSession = (activity: ReturnType<typeof createActivity>, id = 1) => ({
  id,
  activity,
  sessionDate: '2026-10-01',
  startTime: '10:00',
  endTime: '11:00',
  createdAt: new Date(),
});

describe('AttendanceService', () => {
  let service: AttendanceService;
  let usersService: { findById: ReturnType<typeof vi.fn> };
  let activitiesService: { isStudentEnrolled: ReturnType<typeof vi.fn> };
  let certificatesService: {
    issueEligibleCertificates: ReturnType<typeof vi.fn>;
  };
  let sessionRepository: { findOne: ReturnType<typeof vi.fn> };
  let attendanceRepository: {
    create: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    usersService = { findById: vi.fn() };
    activitiesService = {
      isStudentEnrolled: vi.fn().mockResolvedValue(true),
    };
    certificatesService = {
      issueEligibleCertificates: vi.fn().mockResolvedValue({
        activityId: 10,
        eligibleStudents: 0,
        issuedCertificates: 0,
        existingCertificates: 0,
        failedStudents: 0,
      }),
    };
    sessionRepository = { findOne: vi.fn() };
    attendanceRepository = {
      create: vi.fn(),
      save: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        { provide: UsersService, useValue: usersService },
        { provide: ActivitiesService, useValue: activitiesService },
        { provide: CertificatesService, useValue: certificatesService },
        {
          provide: getRepositoryToken(SessionEntity),
          useValue: sessionRepository,
        },
        {
          provide: getRepositoryToken(AttendanceEntity),
          useValue: attendanceRepository,
        },
      ],
    }).compile();

    service = module.get(AttendanceService);
  });

  it('registra asistencia para estudiante inscrito y propietario autenticado', async () => {
    const user = createUser();
    const activity = createActivity();
    const session = createSession(activity, 5);
    const attendance = {
      id: 1,
      user,
      session,
      registrationDate: new Date(),
      status: 'PRESENT',
    };

    usersService.findById.mockResolvedValue(user);
    sessionRepository.findOne.mockResolvedValue(session);
    attendanceRepository.create.mockReturnValue(attendance);
    attendanceRepository.save.mockResolvedValue(attendance);

    await expect(
      service.recordAttendance(20, 1, 10, 5, 'PRESENT'),
    ).resolves.toBe(attendance);
    expect(activitiesService.isStudentEnrolled).toHaveBeenCalledWith(10, 1);
    expect(attendanceRepository.create).toHaveBeenCalledWith({
      user,
      session,
      status: 'PRESENT',
    });
    expect(attendanceRepository.save).toHaveBeenCalledWith(attendance);
  });

  it('rechaza una sesión que no pertenece a la actividad indicada', async () => {
    const session = createSession(createActivity(), 5);
    session.activity.id = 99;
    sessionRepository.findOne.mockResolvedValue(session);

    await expect(
      service.recordAttendance(20, 1, 10, 5, 'PRESENT'),
    ).rejects.toThrow(BadRequestException);
    expect(usersService.findById).not.toHaveBeenCalled();
    expect(attendanceRepository.save).not.toHaveBeenCalled();
  });

  it('rechaza un organizador que no es propietario de la actividad', async () => {
    sessionRepository.findOne.mockResolvedValue(createSession(createActivity('FINISHED', 99), 5));

    await expect(
      service.recordAttendance(20, 1, 10, 5, 'PRESENT'),
    ).rejects.toThrow(ForbiddenException);
    expect(usersService.findById).not.toHaveBeenCalled();
    expect(attendanceRepository.create).not.toHaveBeenCalled();
    expect(attendanceRepository.save).not.toHaveBeenCalled();
  });

  it('rechaza asistencia cuando el estudiante no está inscrito', async () => {
    usersService.findById.mockResolvedValue(createUser());
    sessionRepository.findOne.mockResolvedValue(createSession(createActivity(), 5));
    activitiesService.isStudentEnrolled.mockResolvedValue(false);

    await expect(
      service.recordAttendance(20, 1, 10, 5, 'PRESENT'),
    ).rejects.toThrow(ForbiddenException);
    expect(attendanceRepository.create).not.toHaveBeenCalled();
    expect(attendanceRepository.save).not.toHaveBeenCalled();
  });

  it('propaga errores al consultar la inscripción', async () => {
    const enrollmentError = new Error('Database unavailable');
    usersService.findById.mockResolvedValue(createUser());
    sessionRepository.findOne.mockResolvedValue(createSession(createActivity(), 5));
    activitiesService.isStudentEnrolled.mockRejectedValue(enrollmentError);

    await expect(
      service.recordAttendance(20, 1, 10, 5, 'PRESENT'),
    ).rejects.toBe(enrollmentError);
    expect(attendanceRepository.create).not.toHaveBeenCalled();
    expect(attendanceRepository.save).not.toHaveBeenCalled();
  });

  it('rechaza un estado de asistencia no soportado', async () => {
    await expect(
      service.recordAttendance(20, 1, 10, 5, 'UNKNOWN'),
    ).rejects.toThrow(BadRequestException);
    expect(sessionRepository.findOne).not.toHaveBeenCalled();
  });

  it('rechaza un usuario que no sea estudiante', async () => {
    usersService.findById.mockResolvedValue(createUser('ORGANIZADOR'));
    sessionRepository.findOne.mockResolvedValue(createSession(createActivity(), 5));

    await expect(
      service.recordAttendance(20, 1, 10, 5, 'PRESENT'),
    ).rejects.toThrow(ForbiddenException);
    expect(activitiesService.isStudentEnrolled).not.toHaveBeenCalled();
    expect(attendanceRepository.save).not.toHaveBeenCalled();
  });

  it('rechaza una sesión inexistente', async () => {
    sessionRepository.findOne.mockResolvedValue(null);

    await expect(
      service.recordAttendance(20, 1, 10, 99, 'PRESENT'),
    ).rejects.toThrow('Sesión con id 99 no encontrada');
    expect(usersService.findById).not.toHaveBeenCalled();
    expect(attendanceRepository.save).not.toHaveBeenCalled();
  });

  it('rechaza asistencia en una actividad no finalizada', async () => {
    const user = createUser();
    const activity = createActivity('ACTIVE');
    usersService.findById.mockResolvedValue(user);
    sessionRepository.findOne.mockResolvedValue(createSession(activity, 5));

    await expect(
      service.recordAttendance(20, 1, 10, 5, 'PRESENT'),
    ).rejects.toThrow(BadRequestException);
    expect(attendanceRepository.save).not.toHaveBeenCalled();
  });

  it('convierte la violación de unicidad por sesión en conflicto', async () => {
    const user = createUser();
    const activity = createActivity();
    const session = createSession(activity, 5);
    usersService.findById.mockResolvedValue(user);
    sessionRepository.findOne.mockResolvedValue(session);
    attendanceRepository.create.mockReturnValue({});
    attendanceRepository.save.mockRejectedValue(
      new QueryFailedError('INSERT INTO attendances', [], {
        code: '23505',
        constraint: 'UQ_attendance_user_session',
      }),
    );

    await expect(
      service.recordAttendance(20, 1, 10, 5, 'PRESENT'),
    ).rejects.toThrow(ConflictException);
  });

  it('vuelve a propagar errores de persistencia no relacionados con duplicados', async () => {
    const user = createUser();
    const session = createSession(createActivity(), 5);
    const persistenceError = new Error('Database unavailable');
    usersService.findById.mockResolvedValue(user);
    sessionRepository.findOne.mockResolvedValue(session);
    attendanceRepository.create.mockReturnValue({});
    attendanceRepository.save.mockRejectedValue(persistenceError);

    await expect(
      service.recordAttendance(20, 1, 10, 5, 'PRESENT'),
    ).rejects.toBe(persistenceError);
  });
});
