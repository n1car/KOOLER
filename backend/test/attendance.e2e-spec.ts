import { NotFoundException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryFailedError } from 'typeorm';
import { App } from 'supertest/types';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ActivitiesService } from '../src/activities/activities.service';
import { ActivityEntity } from '../src/activities/entities/activity.entity';
import { RolesGuard } from '../src/common/guards/roles.guard';
import { RolesJwtAuthGuard } from '../src/common/guards/roles-jwt-auth.guard';
import { JwtStrategy } from '../src/auth/strategies/jwt.strategy';
import { AttendanceController } from '../src/attendance/attendance.controller';
import { AttendanceService } from '../src/attendance/attendance.service';
import { AttendanceEntity } from '../src/attendance/entities/attendance.entity';
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

describe('Attendance endpoint (e2e)', () => {
  let app: import('@nestjs/common').INestApplication<App>;
  let jwtService: JwtService;
  let usersById: Map<number, ReturnType<typeof createUser>>;
  let activitiesById: Map<number, ReturnType<typeof createActivity>>;
  let enrolledPairs: Set<string>;
  let attendanceRecords: Map<string, any>;
  let usersService: { findById: ReturnType<typeof vi.fn> };
  let activitiesService: { isStudentEnrolled: ReturnType<typeof vi.fn> };
  let activitiesRepository: { findOneBy: ReturnType<typeof vi.fn> };
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
    activitiesById = new Map([
      [10, createActivity(10, owner)],
      [11, createActivity(11, otherOrganizer)],
      [12, createActivity(12, owner, 'ACTIVE')],
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
    activitiesRepository = {
      findOneBy: vi.fn(
        async ({ id }: { id: number }) => activitiesById.get(id) ?? null,
      ),
    };
    attendanceRepository = {
      create: vi.fn((data) => data),
      save: vi.fn(
        async (attendance: {
          activity: { id: number };
          user: { id: number };
          status: 'PRESENT' | 'ABSENT';
        }) => {
          const key = `${attendance.activity.id}:${attendance.user.id}`;
          if (attendanceRecords.has(key)) {
            throw new QueryFailedError('INSERT INTO attendances', [], {
              code: '23505',
              constraint: 'UQ_attendance_user_activity',
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
          provide: getRepositoryToken(ActivityEntity),
          useValue: activitiesRepository,
        },
        {
          provide: getRepositoryToken(AttendanceEntity),
          useValue: attendanceRepository,
        },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) =>
              key === 'JWT_SECRET' ? JWT_SECRET : undefined,
          },
        },
        { provide: APP_GUARD, useClass: RolesJwtAuthGuard },
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
    app.useGlobalGuards(new RolesGuard(app.get(Reflector)));
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
    studentId = 1,
    status: string = 'PRESENT',
    token?: string,
  ) => {
    const httpRequest = request(app.getHttpServer())
      .post(`/api/activities/${activityId}/attendance`)
      .send({ studentId, status });
    return token
      ? httpRequest.set('Authorization', `Bearer ${token}`)
      : httpRequest;
  };

  it('rejects requests without a JWT', async () => {
    await sendAttendance(10).expect(401);
    expect(attendanceRepository.save).not.toHaveBeenCalled();
  });

  it('rejects an authenticated user without the organizer role', async () => {
    const token = tokenFor(usersById.get(1)!);

    await sendAttendance(10, 1, 'PRESENT', token).expect(403);
    expect(attendanceRepository.save).not.toHaveBeenCalled();
  });

  it('allows the owner organizer to record attendance for an enrolled student safely', async () => {
    const token = tokenFor(usersById.get(2)!);

    const response = await sendAttendance(10, 1, 'PRESENT', token)
      .expect(201)
      .expect({
        id: 1,
        studentId: 1,
        activityId: 10,
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

    await sendAttendance(11, 1, 'PRESENT', token).expect(403);
    expect(usersService.findById).toHaveBeenCalledTimes(1);
    expect(attendanceRepository.save).not.toHaveBeenCalled();
  });

  it('rejects an unregistered student without creating attendance', async () => {
    const token = tokenFor(usersById.get(2)!);
    usersById.set(4, createUser(4, 'ESTUDIANTE'));

    await sendAttendance(10, 4, 'PRESENT', token).expect(403);
    expect(attendanceRepository.save).not.toHaveBeenCalled();
  });

  it('returns 404 when the activity does not exist', async () => {
    const token = tokenFor(usersById.get(2)!);

    await sendAttendance(999, 1, 'PRESENT', token).expect(404);
    expect(attendanceRepository.save).not.toHaveBeenCalled();
  });

  it('rejects attendance for an activity that is not finished', async () => {
    const token = tokenFor(usersById.get(2)!);

    await sendAttendance(12, 1, 'PRESENT', token).expect(400);
    expect(attendanceRepository.save).not.toHaveBeenCalled();
  });

  it('returns 409 for duplicate attendance', async () => {
    const token = tokenFor(usersById.get(2)!);

    await sendAttendance(10, 1, 'PRESENT', token).expect(201);
    await sendAttendance(10, 1, 'PRESENT', token).expect(409);
    expect(attendanceRecords.size).toBe(1);
  });

  it('rejects invalid status and non-integer activity identifiers', async () => {
    const token = tokenFor(usersById.get(2)!);

    await sendAttendance(10, 1, 'UNKNOWN', token).expect(400);
    await sendAttendance('not-a-number', 1, 'PRESENT', token).expect(400);
    expect(attendanceRepository.save).not.toHaveBeenCalled();
  });

  it('rejects a nonexistent or non-student attendance target', async () => {
    const ownerToken = tokenFor(usersById.get(2)!);

    await sendAttendance(10, 999, 'PRESENT', ownerToken).expect(404);
    expect(attendanceRepository.save).not.toHaveBeenCalled();

    await sendAttendance(10, 2, 'PRESENT', ownerToken).expect(403);
    expect(attendanceRepository.save).not.toHaveBeenCalled();
  });

  it('rejects unknown request properties instead of accepting a client organizer ID', async () => {
    const token = tokenFor(usersById.get(2)!);

    await request(app.getHttpServer())
      .post('/api/activities/10/attendance')
      .set('Authorization', `Bearer ${token}`)
      .send({ studentId: 1, status: 'PRESENT', organizerId: 3 })
      .expect(400);
    expect(attendanceRepository.save).not.toHaveBeenCalled();
  });
});
