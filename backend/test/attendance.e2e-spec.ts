import { NotFoundException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryFailedError } from 'typeorm';
import { App } from 'supertest/types';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ActivitiesService } from '../src/activities/activities.service';
import { SessionEntity } from '../src/activities/entities/session.entity';
import { JwtStrategy } from '../src/auth/strategies/jwt.strategy';
import { AttendanceController } from '../src/attendance/attendance.controller';
import { AttendanceService } from '../src/attendance/attendance.service';
import { AttendanceEntity } from '../src/attendance/entities/attendance.entity';
import { CertificatesService } from '../src/certificates/certificates.service';
import { UsersService } from '../src/users/users.service';

const JWT_SECRET = 'attendance-http-test-secret';

const createUser = (id: number, roleName: string) => ({
  id,
  firstName: roleName,
  lastName: 'Test',
  email: `${roleName.toLowerCase()}-${id}@example.com`,
  passwordHash: `hash-${id}`,
  status: 'ACTIVE',
  role: { id, name: roleName },
});

const createActivity = (
  id: number,
  owner: ReturnType<typeof createUser>,
  status = 'FINISHED',
) => ({
  id,
  name: `Activity ${id}`,
  description: 'Test activity',
  date: '2026-10-01',
  startTime: '10:00',
  endTime: '11:00',
  capacity: 20,
  status,
  registrationDeadline: new Date('2026-09-30T23:59:59Z'),
  isCertifiable: false,
  minAttendancePercentage: 80,
  organizer: owner,
  createdAt: new Date(),
});

const createSession = (id: number, activity: ReturnType<typeof createActivity>) => ({
  id,
  activity,
  sessionDate: '2026-10-01',
  startTime: '10:00',
  endTime: '11:00',
  createdAt: new Date(),
});

describe('Attendance endpoint (e2e)', () => {
  let app: import('@nestjs/common').INestApplication<App>;
  let jwtService: JwtService;
  let usersById: Map<number, ReturnType<typeof createUser>>;
  let sessionsById: Map<number, ReturnType<typeof createSession>>;
  let enrolledPairs: Set<string>;
  let attendanceRecords: Map<string, any>;
  let usersService: { findById: ReturnType<typeof vi.fn> };
  let activitiesService: { isStudentEnrolled: ReturnType<typeof vi.fn> };
  let sessionRepository: { findOne: ReturnType<typeof vi.fn> };
  let attendanceRepository: {
    create: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    const student = createUser(1, 'ESTUDIANTE');
    const owner = createUser(2, 'ORGANIZADOR');
    const otherOrganizer = createUser(3, 'ORGANIZADOR');
    usersById = new Map([
      [student.id, student],
      [owner.id, owner],
      [otherOrganizer.id, otherOrganizer],
    ]);

    const activity10 = createActivity(10, owner);
    const activity11 = createActivity(11, otherOrganizer);
    const activity12 = createActivity(12, owner, 'ACTIVE');
    sessionsById = new Map([
      [1, createSession(1, activity10)],
      [2, createSession(2, activity12)],
      [3, createSession(3, activity11)],
    ]);
    enrolledPairs = new Set(['10:1', '12:1']);
    attendanceRecords = new Map();

    usersService = {
      findById: vi.fn(async (id: number) => {
        const user = usersById.get(id);
        if (!user) {
          throw new NotFoundException(`Usuario con id ${id} no encontrado`);
        }
        return user;
      }),
    };

    activitiesService = {
      isStudentEnrolled: vi.fn(async (activityId: number, studentId: number) =>
        enrolledPairs.has(`${activityId}:${studentId}`),
      ),
    };

    sessionRepository = {
      findOne: vi.fn(async ({ where: { id } }: { where: { id: number } }) =>
        sessionsById.get(id) ?? null,
      ),
    };

    attendanceRepository = {
      create: vi.fn((data) => data),
      save: vi.fn(
        async (attendance: {
          session: { id: number };
          user: { id: number };
          status: 'PRESENT' | 'ABSENT';
        }) => {
          const key = `${attendance.session.id}:${attendance.user.id}`;
          if (attendanceRecords.has(key)) {
            throw new QueryFailedError('INSERT INTO attendances', [], {
              code: '23505',
              constraint: 'UQ_attendance_user_session',
            });
          }

          const savedAttendance = {
            ...attendance,
            id: attendanceRecords.size + 1,
            registrationDate: new Date('2026-10-02T12:00:00Z'),
          };
          attendanceRecords.set(key, savedAttendance);
          return savedAttendance;
        },
      ),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: JWT_SECRET,
          signOptions: { expiresIn: '1h' },
        }),
      ],
      controllers: [AttendanceController],
      providers: [
        AttendanceService,
        JwtStrategy,
        { provide: UsersService, useValue: usersService },
        { provide: ActivitiesService, useValue: activitiesService },
        {
          provide: CertificatesService,
          useValue: {
            issueEligibleCertificates: vi.fn().mockResolvedValue({
              activityId: 0,
              eligibleStudents: 0,
              issuedCertificates: 0,
              existingCertificates: 0,
              failedStudents: 0,
            }),
          },
        },
        { provide: getRepositoryToken(SessionEntity), useValue: sessionRepository },
        {
          provide: getRepositoryToken(AttendanceEntity),
          useValue: attendanceRepository,
        },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) =>
              key === 'JWT_SECRET' ? JWT_SECRET : undefined,
            getOrThrow: (key: string) => {
              const value = key === 'JWT_SECRET' ? JWT_SECRET : undefined;
              if (value === undefined) throw new Error(`Missing ${key}`);
              return value;
            },
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    jwtService = app.get(JwtService);
  });

  afterEach(async () => {
    await app.close();
  });

  const tokenFor = (user: ReturnType<typeof createUser>) =>
    jwtService.sign({ sub: user.id, email: user.email });

  const sendAttendance = (
    activityId: number | string,
    sessionId: number | string,
    studentId = 1,
    status: string = 'PRESENT',
    token?: string,
  ) => {
    const httpRequest = request(app.getHttpServer())
      .post(`/api/activities/${activityId}/sessions/${sessionId}/attendance`)
      .send({ studentId, status });
    return token ? httpRequest.set('Authorization', `Bearer ${token}`) : httpRequest;
  };

  it('rejects requests without a JWT', async () => {
    await sendAttendance(10, 1, 1, 'PRESENT').expect(401);
    expect(attendanceRepository.save).not.toHaveBeenCalled();
  });

  it('rejects an authenticated user without the organizer role', async () => {
    const token = tokenFor(usersById.get(1)!);

    await sendAttendance(10, 1, 1, 'PRESENT', token).expect(403);
    expect(attendanceRepository.save).not.toHaveBeenCalled();
  });

  it('allows the owner organizer to record attendance for an enrolled student safely', async () => {
    const token = tokenFor(usersById.get(2)!);

    const response = await sendAttendance(10, 1, 1, 'PRESENT', token)
      .expect(201)
      .expect({
        id: 1,
        studentId: 1,
        activityId: 10,
        sessionId: 1,
        status: 'PRESENT',
        registrationDate: '2026-10-02T12:00:00.000Z',
      });

    expect(response.text).not.toContain('passwordHash');
    expect(response.body.user).toBeUndefined();
    expect(response.body.activity).toBeUndefined();
    expect(attendanceRepository.save).toHaveBeenCalledTimes(1);
  });

  it('rejects an organizer who does not own the activity', async () => {
    const token = tokenFor(usersById.get(2)!);

    await sendAttendance(11, 3, 1, 'PRESENT', token).expect(403);
    expect(usersService.findById).toHaveBeenCalledWith(2);
    expect(attendanceRepository.save).not.toHaveBeenCalled();
  });

  it('rejects a student who is not enrolled in the activity', async () => {
    const token = tokenFor(usersById.get(2)!);
    enrolledPairs.delete('10:1');

    await sendAttendance(10, 1, 1, 'PRESENT', token).expect(403);
    expect(attendanceRepository.save).not.toHaveBeenCalled();
  });

  it('returns 404 when the session does not exist', async () => {
    const token = tokenFor(usersById.get(2)!);

    await sendAttendance(10, 999, 1, 'PRESENT', token).expect(404);
    expect(attendanceRepository.save).not.toHaveBeenCalled();
  });

  it('returns 400 when the session belongs to a different activity', async () => {
    const token = tokenFor(usersById.get(2)!);

    await sendAttendance(10, 3, 1, 'PRESENT', token).expect(400);
    expect(attendanceRepository.save).not.toHaveBeenCalled();
  });

  it('rejects attendance for an activity that is not finished', async () => {
    const token = tokenFor(usersById.get(2)!);

    await sendAttendance(12, 2, 1, 'PRESENT', token).expect(400);
    expect(attendanceRepository.save).not.toHaveBeenCalled();
  });

  it('returns 409 for duplicate attendance in the same session', async () => {
    const token = tokenFor(usersById.get(2)!);

    await sendAttendance(10, 1, 1, 'PRESENT', token).expect(201);
    await sendAttendance(10, 1, 1, 'PRESENT', token).expect(409);
    expect(attendanceRecords.size).toBe(1);
  });

  it('rejects invalid status and non-integer identifiers', async () => {
    const token = tokenFor(usersById.get(2)!);

    await sendAttendance(10, 1, 1, 'UNKNOWN', token).expect(400);
    await sendAttendance('not-a-number', 1, 1, 'PRESENT', token).expect(400);
    await sendAttendance(10, 'not-a-number', 1, 'PRESENT', token).expect(400);
    expect(attendanceRepository.save).not.toHaveBeenCalled();
  });

  it('rejects nonexistent or non-student attendance targets', async () => {
    const ownerToken = tokenFor(usersById.get(2)!);

    await sendAttendance(10, 1, 999, 'PRESENT', ownerToken).expect(404);
    expect(attendanceRepository.save).not.toHaveBeenCalled();

    await sendAttendance(10, 1, 2, 'PRESENT', ownerToken).expect(403);
    expect(attendanceRepository.save).not.toHaveBeenCalled();
  });

  it('rejects unknown request properties instead of accepting a client organizer ID', async () => {
    const token = tokenFor(usersById.get(2)!);

    await request(app.getHttpServer())
      .post('/api/activities/10/sessions/1/attendance')
      .set('Authorization', `Bearer ${token}`)
      .send({ studentId: 1, status: 'PRESENT', organizerId: 3 })
      .expect(400);
    expect(attendanceRepository.save).not.toHaveBeenCalled();
  });
});