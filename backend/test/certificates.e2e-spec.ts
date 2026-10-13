import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { JwtStrategy } from '../src/auth/strategies/jwt.strategy';
import { RolesGuard } from '../src/common/guards/roles.guard';
import { RolesJwtAuthGuard } from '../src/common/guards/roles-jwt-auth.guard';
import { CertificatesController } from '../src/certificates/certificates.controller';
import { CertificatesService } from '../src/certificates/certificates.service';
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
  user: { id: studentId },
  activity: { id: activityId },
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
      findOne: vi.fn(async () => null),
      create: vi.fn((data) => data),
      save: vi.fn(async (data) => data),
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
          provide: ConfigService,
          useValue: {
            get: (key: string) => (key === 'JWT_SECRET' ? JWT_SECRET : undefined),
          },
        },
        { provide: APP_GUARD, useClass: RolesJwtAuthGuard },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalGuards(new RolesGuard(app.get(Reflector)));
    await app.init();
    jwtService = app.get(JwtService);
  });

  afterEach(async () => {
    await app.close();
  });

  const tokenFor = (user: ReturnType<typeof createUser>) =>
    jwtService.sign({ sub: user.id, email: user.email });

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
});
