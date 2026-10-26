import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import PDFDocument from 'pdfkit';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { JwtStrategy } from '../src/auth/strategies/jwt.strategy';
import { ActivityEntity } from '../src/activities/entities/activity.entity';
import { EnrollmentEntity } from '../src/activities/entities/enrollment.entity';
import { SessionEntity } from '../src/activities/entities/session.entity';
import { AttendanceEntity } from '../src/attendance/entities/attendance.entity';
import { CertificatesController } from '../src/certificates/certificates.controller';
import {
  CERTIFICATE_PDF_DOCUMENT_FACTORY,
  CertificatesService,
} from '../src/certificates/certificates.service';
import { CertificateEntity } from '../src/certificates/entities/certificate.entity';
import { UsersService } from '../src/users/users.service';

const JWT_SECRET = 'certificates-e2e-secret';

const createUser = (id: number, roleName: string) => ({
  id,
  firstName: 'User',
  lastName: `${id}`,
  email: `${roleName.toLowerCase()}-${id}@example.com`,
  passwordHash: `hash-${id}`,
  status: 'ACTIVE',
  role: { id, name: roleName },
});

const createCertificate = (id: number, studentId: number, activityId: number) => ({
  id,
  user: {
    id: studentId,
    firstName: 'User',
    lastName: `${studentId}`,
  },
  activity: { id: activityId, name: `Activity ${activityId}` },
  issueDate: new Date('2026-10-02T12:00:00Z'),
  certificateCode: `CERT-${studentId}-${activityId}`,
});

describe('Certificates endpoint (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let usersById: Map<number, ReturnType<typeof createUser>>;
  let certificatesByStudent: Map<number, any[]>;
  let usersService: { findById: ReturnType<typeof vi.fn> };
  let certificateRepository: {
    find: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
  };
  let activityRepository: { findOneBy: ReturnType<typeof vi.fn> };
  let sessionRepository: { find: ReturnType<typeof vi.fn> };
  let attendanceRepository: { find: ReturnType<typeof vi.fn> };
  let enrollmentRepository: {
    find: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    const student = createUser(10, 'ESTUDIANTE');
    const organizer = createUser(20, 'ORGANIZADOR');
    usersById = new Map([
      [student.id, student],
      [organizer.id, organizer],
    ]);

    certificatesByStudent = new Map<number, any[]>([
      [10, [createCertificate(1, 10, 30)]],
      [20, []],
    ]);

    usersService = {
      findById: vi.fn(async (id: number) => {
        const user = usersById.get(id);
        if (!user) {
          throw new Error(`user-${id} not found`);
        }
        return user;
      }),
    };

    certificateRepository = {
      find: vi.fn(async ({ where }: { where: { user: { id: number } } }) => {
        return certificatesByStudent.get(where.user.id) ?? [];
      }),
      findOne: vi.fn(
        async ({ where }: { where: { id: number; user: { id: number } } }) =>
          certificatesByStudent
            .get(where.user.id)
            ?.find((certificate) => certificate.id === where.id) ?? null,
      ),
      create: vi.fn((data) => data),
      save: vi.fn(async (data) => data),
    };
    activityRepository = {
      findOneBy: vi.fn(async (where: { id: number }) => ({
        id: where.id,
        status: 'FINISHED',
        isCertifiable: true,
        minAttendancePercentage: 80,
      })),
    };
    sessionRepository = {
      find: vi.fn(async () => [
        { id: 1, activity: { id: 30 } },
        { id: 2, activity: { id: 30 } },
        { id: 3, activity: { id: 30 } },
        { id: 4, activity: { id: 30 } },
        { id: 5, activity: { id: 30 } },
      ]),
    };
    attendanceRepository = {
      find: vi.fn(async () => [
        { user: { id: 10 }, session: { id: 1 }, status: 'PRESENT' },
        { user: { id: 10 }, session: { id: 2 }, status: 'PRESENT' },
        { user: { id: 10 }, session: { id: 3 }, status: 'PRESENT' },
        { user: { id: 10 }, session: { id: 4 }, status: 'PRESENT' },
      ]),
    };
    enrollmentRepository = {
      find: vi.fn(),
      findOne: vi.fn(async () => ({ user: { id: 10 }, activity: { id: 30 } })),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: JWT_SECRET,
          signOptions: { expiresIn: '1h' },
        }),
      ],
      controllers: [CertificatesController],
      providers: [
        CertificatesService,
        JwtStrategy,
        { provide: UsersService, useValue: usersService },
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
        {
          provide: CERTIFICATE_PDF_DOCUMENT_FACTORY,
          useValue: (options: ConstructorParameters<typeof PDFDocument>[0]) =>
            new PDFDocument(options),
        },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => (key === 'JWT_SECRET' ? JWT_SECRET : undefined),
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
    await app.init();
    jwtService = app.get(JwtService);
  });

  afterEach(async () => {
    await app.close();
  });

  const tokenFor = (user: ReturnType<typeof createUser>) =>
    jwtService.sign({ sub: user.id, email: user.email });

  // Los recursos personales no se consultan sin JWT ni desde un rol distinto al estudiante.
  it('rejects requests without a JWT', async () => {
    await request(app.getHttpServer()).get('/api/certificates').expect(401);
  });

  it('rejects authenticated users without the STUDENT role', async () => {
    const token = tokenFor(usersById.get(20)!);

    await request(app.getHttpServer())
      .get('/api/certificates')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  it('returns only the current student certificates', async () => {
    const token = tokenFor(usersById.get(10)!);

    const response = await request(app.getHttpServer())
      .get('/api/certificates')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual([
      {
        id: 1,
        studentId: 10,
        activityId: 30,
        certificateCode: 'CERT-10-30',
        issueDate: '2026-10-02T12:00:00.000Z',
      },
    ]);
    expect(JSON.stringify(response.body)).not.toContain('passwordHash');
  });

  it('returns eligibility only for the authenticated and enrolled student', async () => {
    const token = tokenFor(usersById.get(10)!);

    const response = await request(app.getHttpServer())
      .get('/api/certificates/activities/30/eligibility')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual({
      activityId: 30,
      sessionsTotal: 5,
      sessionsPresent: 4,
      attendancePercentage: 80,
      minimumAttendancePercentage: 80,
      eligible: true,
    });
    expect(enrollmentRepository.findOne).toHaveBeenCalledWith({
      where: { activity: { id: 30 }, user: { id: 10 } },
    });
    expect(JSON.stringify(response.body)).not.toContain('passwordHash');
  });

  it('does not disclose eligibility to a different role or a non-enrolled student', async () => {
    const organizerToken = tokenFor(usersById.get(20)!);
    await request(app.getHttpServer())
      .get('/api/certificates/activities/30/eligibility')
      .set('Authorization', `Bearer ${organizerToken}`)
      .expect(403);

    const studentToken = tokenFor(usersById.get(10)!);
    enrollmentRepository.findOne.mockResolvedValue(null);
    await request(app.getHttpServer())
      .get('/api/certificates/activities/30/eligibility')
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(403);
  });

  it('reports an active activity and an activity without sessions as ineligible', async () => {
    const token = tokenFor(usersById.get(10)!);
    activityRepository.findOneBy.mockResolvedValue({
      id: 30,
      status: 'ACTIVE',
      isCertifiable: true,
    });

    const activeResponse = await request(app.getHttpServer())
      .get('/api/certificates/activities/30/eligibility')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(activeResponse.body).toMatchObject({
      eligible: false,
      reason: 'ACTIVITY_NOT_FINISHED',
    });

    activityRepository.findOneBy.mockResolvedValue({
      id: 30,
      status: 'FINISHED',
      isCertifiable: true,
    });
    sessionRepository.find.mockResolvedValue([]);

    const noSessionsResponse = await request(app.getHttpServer())
      .get('/api/certificates/activities/30/eligibility')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(noSessionsResponse.body).toMatchObject({
      sessionsTotal: 0,
      attendancePercentage: 0,
      eligible: false,
      reason: 'NO_SESSIONS',
    });
  });

  it('returns 404 when the student has no certificates', async () => {
    const organizerToken = tokenFor(usersById.get(20)!);

    await request(app.getHttpServer())
      .get('/api/certificates')
      .set('Authorization', `Bearer ${organizerToken}`)
      .expect(403);

    const studentToken = tokenFor(usersById.get(10)!);
    certificatesByStudent.set(10, []);

    await request(app.getHttpServer())
      .get('/api/certificates')
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(404);
  });

  it('downloads a PDF for the authenticated student certificate', async () => {
    const token = tokenFor(usersById.get(10)!);
    const response = await request(app.getHttpServer())
      .get('/api/certificates/1/download')
      .set('Authorization', `Bearer ${token}`)
      .buffer(true)
      .parse((res, callback) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => callback(null, Buffer.concat(chunks)));
      })
      .expect(200);

    expect(response.headers['content-type']).toContain('application/pdf');
    expect(response.headers['content-disposition']).toContain(
      'attachment; filename="certificate-CERT-10-30.pdf"',
    );
    expect((response.body as Buffer).subarray(0, 5).toString()).toBe('%PDF-');
  });

  it('requires JWT and the STUDENT role to download certificates', async () => {
    await request(app.getHttpServer())
      .get('/api/certificates/1/download')
      .expect(401);

    const organizerToken = tokenFor(usersById.get(20)!);
    await request(app.getHttpServer())
      .get('/api/certificates/1/download')
      .set('Authorization', `Bearer ${organizerToken}`)
      .expect(403);
  });

  // Se responde igual ante certificados ajenos e inexistentes para no revelar su existencia.
  it('does not allow downloading another student certificate or a missing certificate', async () => {
    certificatesByStudent.set(20, [createCertificate(2, 20, 30)]);
    const token = tokenFor(usersById.get(10)!);

    await request(app.getHttpServer())
      .get('/api/certificates/2/download')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);

    await request(app.getHttpServer())
      .get('/api/certificates/999/download')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });
});
