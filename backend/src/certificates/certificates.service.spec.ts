import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryFailedError } from 'typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ActivityEntity } from '../activities/entities/activity.entity';
import { EnrollmentEntity } from '../activities/entities/enrollment.entity';
import { SessionEntity } from '../activities/entities/session.entity';
import { AttendanceEntity } from '../attendance/entities/attendance.entity';
import { CertificateEntity } from './entities/certificate.entity';
import { CertificatesService } from './certificates.service';

const createActivity = (
  status: ActivityEntity['status'] = 'FINISHED',
  isCertifiable = true,
): ActivityEntity =>
  ({
    id: 20,
    status,
    isCertifiable,
    minAttendancePercentage: 80,
  }) as ActivityEntity;

const createSessions = (count: number, activityId = 20): SessionEntity[] =>
  Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    activity: { id: activityId },
  })) as SessionEntity[];

const createAttendance = (
  studentId: number,
  sessionId: number,
  status: 'PRESENT' | 'ABSENT',
  activityId = 20,
): AttendanceEntity =>
  ({
    user: { id: studentId },
    session: { id: sessionId, activity: { id: activityId } },
    status,
  }) as AttendanceEntity;

const createEnrollment = (studentId: number): EnrollmentEntity =>
  ({
    user: { id: studentId },
    activity: { id: 20 },
  }) as EnrollmentEntity;

const createCertificate = (studentId = 10, activityId = 20) =>
  ({
    id: studentId,
    user: { id: studentId },
    activity: { id: activityId },
    certificateCode: `CERT-${studentId}-${activityId}`,
  }) as CertificateEntity;

describe('CertificatesService', () => {
  let service: CertificatesService;
  let certificateRepository: {
    find: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
  };
  let activityRepository: {
    findOneBy: ReturnType<typeof vi.fn>;
  };
  let sessionRepository: {
    find: ReturnType<typeof vi.fn>;
  };
  let attendanceRepository: {
    find: ReturnType<typeof vi.fn>;
  };
  let enrollmentRepository: {
    find: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    certificateRepository = {
      find: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn((data) => data),
      save: vi.fn(),
    };
    activityRepository = { findOneBy: vi.fn() };
    sessionRepository = { find: vi.fn() };
    attendanceRepository = { find: vi.fn() };
    enrollmentRepository = {
      find: vi.fn(),
      findOne: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CertificatesService,
        {
          provide: getRepositoryToken(CertificateEntity),
          useValue: certificateRepository,
        },
        {
          provide: getRepositoryToken(ActivityEntity),
          useValue: activityRepository,
        },
        {
          provide: getRepositoryToken(SessionEntity),
          useValue: sessionRepository,
        },
        {
          provide: getRepositoryToken(AttendanceEntity),
          useValue: attendanceRepository,
        },
        {
          provide: getRepositoryToken(EnrollmentEntity),
          useValue: enrollmentRepository,
        },
      ],
    }).compile();

    service = module.get(CertificatesService);
  });

  const mockStudentEligibility = (
    sessions: SessionEntity[],
    attendances: AttendanceEntity[],
    activity = createActivity(),
  ) => {
    activityRepository.findOneBy.mockResolvedValue(activity);
    enrollmentRepository.findOne.mockResolvedValue(createEnrollment(10));
    sessionRepository.find.mockResolvedValue(sessions);
    attendanceRepository.find.mockResolvedValue(attendances);
  };

  it('devuelve certificados del estudiante actual ordenados por fecha', async () => {
    const certificates = [createCertificate()];
    certificateRepository.find.mockResolvedValue(certificates);

    await expect(service.findByStudentId(10)).resolves.toEqual(certificates);
    expect(certificateRepository.find).toHaveBeenCalledWith({
      where: { user: { id: 10 } },
      relations: { activity: true, user: true },
      order: { issueDate: 'DESC' },
    });
  });

  it('considera elegible la asistencia exactamente del 80 por ciento', async () => {
    const sessions = createSessions(5);
    mockStudentEligibility(sessions, [
      createAttendance(10, 1, 'PRESENT'),
      createAttendance(10, 2, 'PRESENT'),
      createAttendance(10, 3, 'PRESENT'),
      createAttendance(10, 4, 'PRESENT'),
    ]);

    await expect(service.getEligibilityForStudent(10, 20)).resolves.toMatchObject({
      sessionsTotal: 5,
      sessionsPresent: 4,
      attendancePercentage: 80,
      minimumAttendancePercentage: 80,
      eligible: true,
    });
  });

  it('cuenta las sesiones sin registro como ausencias y rechaza menos del 80 por ciento', async () => {
    mockStudentEligibility(createSessions(5), [
      createAttendance(10, 1, 'PRESENT'),
      createAttendance(10, 2, 'PRESENT'),
      createAttendance(10, 3, 'PRESENT'),
      createAttendance(10, 4, 'ABSENT'),
    ]);

    await expect(service.getEligibilityForStudent(10, 20)).resolves.toMatchObject({
      sessionsTotal: 5,
      sessionsPresent: 3,
      attendancePercentage: 60,
      eligible: false,
      reason: 'BELOW_MINIMUM',
    });
  });

  it('cuenta una sesion presente una sola vez aunque existan registros repetidos en los datos de prueba', async () => {
    mockStudentEligibility(createSessions(5), [
      createAttendance(10, 1, 'PRESENT'),
      createAttendance(10, 1, 'PRESENT'),
      createAttendance(10, 2, 'PRESENT'),
      createAttendance(10, 3, 'PRESENT'),
      createAttendance(10, 4, 'PRESENT'),
    ]);

    await expect(service.getEligibilityForStudent(10, 20)).resolves.toMatchObject({
      sessionsTotal: 5,
      sessionsPresent: 4,
      eligible: true,
    });
  });

  it('solo cuenta asistencias PRESENT asociadas a sesiones de la actividad', async () => {
    const sessions = createSessions(1);
    const attendanceFromAnotherActivity = createAttendance(10, 99, 'PRESENT', 999);
    mockStudentEligibility(sessions, [
      createAttendance(10, 1, 'ABSENT'),
      attendanceFromAnotherActivity,
    ]);

    await expect(service.getEligibilityForStudent(10, 20)).resolves.toMatchObject({
      sessionsTotal: 1,
      sessionsPresent: 0,
      attendancePercentage: 0,
      eligible: false,
    });
    expect(attendanceRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ session: { id: expect.anything() } }),
      }),
    );
  });

  it('no otorga elegibilidad para una actividad sin sesiones', async () => {
    mockStudentEligibility([], []);

    const eligibility = await service.getEligibilityForStudent(10, 20);
    expect(eligibility).toMatchObject({
      sessionsTotal: 0,
      sessionsPresent: 0,
      attendancePercentage: 0,
      eligible: false,
      reason: 'NO_SESSIONS',
    });
    expect(Number.isNaN(eligibility.attendancePercentage)).toBe(false);
    expect(attendanceRepository.find).not.toHaveBeenCalled();
  });

  it.each(['ACTIVE', 'CANCELLED'] as const)(
    'no considera elegible una actividad %s',
    async (status) => {
      mockStudentEligibility(
        createSessions(5),
        Array.from({ length: 5 }, (_, index) =>
          createAttendance(10, index + 1, 'PRESENT'),
        ),
        createActivity(status),
      );

      await expect(service.getEligibilityForStudent(10, 20)).resolves.toMatchObject({
        eligible: false,
        reason: 'ACTIVITY_NOT_FINISHED',
      });
    },
  );

  it('no considera elegible una actividad marcada como no certificable', async () => {
    mockStudentEligibility(
      createSessions(5),
      Array.from({ length: 5 }, (_, index) =>
        createAttendance(10, index + 1, 'PRESENT'),
      ),
      createActivity('FINISHED', false),
    );

    await expect(service.getEligibilityForStudent(10, 20)).resolves.toMatchObject({
      eligible: false,
      reason: 'ACTIVITY_NOT_CERTIFIABLE',
    });
  });

  it('impide consultar la elegibilidad de una actividad no inscrita', async () => {
    activityRepository.findOneBy.mockResolvedValue(createActivity());
    enrollmentRepository.findOne.mockResolvedValue(null);

    await expect(service.getEligibilityForStudent(10, 20)).rejects.toThrow(
      ForbiddenException,
    );
    expect(sessionRepository.find).not.toHaveBeenCalled();
  });

  it.each(['ACTIVE', 'CANCELLED'] as const)(
    'no emite certificados para una actividad %s',
    async (status) => {
      activityRepository.findOneBy.mockResolvedValue(createActivity(status));

      await expect(service.issueEligibleCertificates(20)).rejects.toThrow(
        BadRequestException,
      );
      expect(certificateRepository.save).not.toHaveBeenCalled();
    },
  );

  it('no emite certificados para actividades no certificables', async () => {
    activityRepository.findOneBy.mockResolvedValue(
      createActivity('FINISHED', false),
    );

    await expect(service.issueEligibleCertificates(20)).resolves.toEqual({
      activityId: 20,
      eligibleStudents: 0,
      issuedCertificates: 0,
      existingCertificates: 0,
    });
    expect(sessionRepository.find).not.toHaveBeenCalled();
    expect(certificateRepository.save).not.toHaveBeenCalled();
  });

  it('no emite certificados si la actividad no tiene sesiones', async () => {
    activityRepository.findOneBy.mockResolvedValue(createActivity());
    sessionRepository.find.mockResolvedValue([]);

    await expect(service.issueEligibleCertificates(20)).resolves.toMatchObject({
      eligibleStudents: 0,
      issuedCertificates: 0,
    });
    expect(enrollmentRepository.find).not.toHaveBeenCalled();
    expect(certificateRepository.save).not.toHaveBeenCalled();
  });

  it('emite únicamente al estudiante que alcanza el umbral', async () => {
    const sessions = createSessions(5);
    const firstCertificate = createCertificate(10);
    const enrollments = [createEnrollment(10), createEnrollment(11)];
    enrollmentRepository.find.mockResolvedValue(enrollments);
    activityRepository.findOneBy.mockResolvedValue(createActivity());
    sessionRepository.find.mockResolvedValue(sessions);
    attendanceRepository.find.mockResolvedValue([
      ...Array.from({ length: 4 }, (_, index) =>
        createAttendance(10, index + 1, 'PRESENT'),
      ),
      ...Array.from({ length: 3 }, (_, index) =>
        createAttendance(11, index + 1, 'PRESENT'),
      ),
      createAttendance(11, 4, 'ABSENT'),
    ]);
    certificateRepository.findOne.mockResolvedValue(null);
    certificateRepository.save.mockResolvedValue(firstCertificate);

    await expect(service.issueEligibleCertificates(20)).resolves.toEqual({
      activityId: 20,
      eligibleStudents: 1,
      issuedCertificates: 1,
      existingCertificates: 0,
    });
    expect(certificateRepository.save).toHaveBeenCalledTimes(1);
    expect(certificateRepository.create).toHaveBeenCalledWith({
      user: { id: 10 },
      activity: { id: 20 },
      certificateCode: expect.stringMatching(/^[A-F0-9]{32}$/),
    });
  });

  it('hace idempotente la emisión al repetir el proceso', async () => {
    const existing = createCertificate(10);
    activityRepository.findOneBy.mockResolvedValue(createActivity());
    sessionRepository.find.mockResolvedValue(createSessions(1));
    enrollmentRepository.find.mockResolvedValue([createEnrollment(10)]);
    attendanceRepository.find.mockResolvedValue([
      createAttendance(10, 1, 'PRESENT'),
    ]);
    certificateRepository.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(existing);
    certificateRepository.save.mockResolvedValue(existing);

    const firstResult = await service.issueEligibleCertificates(20);
    const secondResult = await service.issueEligibleCertificates(20);

    expect(firstResult).toEqual({
      activityId: 20,
      eligibleStudents: 1,
      issuedCertificates: 1,
      existingCertificates: 0,
    });
    expect(secondResult).toEqual({
      activityId: 20,
      eligibleStudents: 1,
      issuedCertificates: 0,
      existingCertificates: 1,
    });
    expect(certificateRepository.save).toHaveBeenCalledTimes(1);
  });

  it('reanuda con otro código si la restricción única detecta una colisión de código', async () => {
    activityRepository.findOneBy.mockResolvedValue(createActivity());
    sessionRepository.find.mockResolvedValue(createSessions(1));
    enrollmentRepository.find.mockResolvedValue([createEnrollment(10)]);
    attendanceRepository.find.mockResolvedValue([
      createAttendance(10, 1, 'PRESENT'),
    ]);
    certificateRepository.findOne.mockResolvedValue(null);
    certificateRepository.save
      .mockRejectedValueOnce(
        new QueryFailedError('INSERT INTO certificates', [], {
          code: '23505',
        }),
      )
      .mockResolvedValueOnce(createCertificate(10));

    await expect(service.issueEligibleCertificates(20)).resolves.toMatchObject({
      issuedCertificates: 1,
    });
    expect(certificateRepository.save).toHaveBeenCalledTimes(2);
  });

  it('propaga los fallos de persistencia como error del servidor', async () => {
    activityRepository.findOneBy.mockResolvedValue(createActivity());
    sessionRepository.find.mockResolvedValue(createSessions(1));
    enrollmentRepository.find.mockResolvedValue([createEnrollment(10)]);
    attendanceRepository.find.mockResolvedValue([
      createAttendance(10, 1, 'PRESENT'),
    ]);
    certificateRepository.findOne.mockResolvedValue(null);
    certificateRepository.save.mockRejectedValue(new Error('DB unavailable'));

    await expect(service.issueEligibleCertificates(20)).rejects.toThrow(
      InternalServerErrorException,
    );
  });
});
