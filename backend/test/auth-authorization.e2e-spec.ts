import {
  Controller,
  Get,
  INestApplication,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { CurrentUser } from '../src/common/decorators/current-user.decorator';
import { Roles } from '../src/common/decorators/roles.decorator';
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard';
import { RolesGuard } from '../src/common/guards/roles.guard';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { JwtStrategy } from '../src/auth/strategies/jwt.strategy';
import { UsersService } from '../src/users/users.service';
import request from 'supertest';
import { App } from 'supertest/types';
import * as bcrypt from 'bcrypt';
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

const JWT_SECRET = 'authorization-e2e-test-secret';
const PASSWORD = 'Password123!';
const usersById = new Map<number, any>();
const usersByEmail = new Map<string, any>();

const createUser = (
  id: number,
  roleName: string,
  email: string,
  passwordHash: string,
) => ({
  id,
  firstName: roleName,
  lastName: 'Test',
  email,
  passwordHash,
  status: 'ACTIVE',
  role: { id: roleName === 'ORGANIZADOR' ? 2 : 1, name: roleName },
});

const usersService = {
  findById: vi.fn(async (id: number) => usersById.get(id) ?? null),
  findByEmail: vi.fn(async (email: string) => usersByEmail.get(email) ?? null),
  create: vi.fn(async (data: any) => {
    const user = createUser(
      3,
      data.roleName ?? 'ESTUDIANTE',
      data.email,
      data.passwordHash,
    );
    usersById.set(user.id, user);
    usersByEmail.set(user.email, user);
    return user;
  }),
};

@Controller('authorization-test')
class ProtectedTestController {
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('organizer')
  @Roles('ORGANIZADOR')
  getOrganizerResource(@CurrentUser() user: any) {
    return { userId: user.id, role: user.role.name };
  }
}

describe('Authentication and role authorization (e2e)', () => {
  let app: INestApplication<App>;
  let jwtService: JwtService;
  let student: any;
  let organizer: any;

  beforeAll(async () => {
    const passwordHash = await bcrypt.hash(PASSWORD, 4);
    student = createUser(1, 'ESTUDIANTE', 'student@example.com', passwordHash);
    organizer = createUser(
      2,
      'ORGANIZADOR',
      'organizer@example.com',
      passwordHash,
    );
  });

  beforeEach(async () => {
    usersById.clear();
    usersByEmail.clear();
    usersById.set(student.id, student);
    usersById.set(organizer.id, organizer);
    usersByEmail.set(student.email, student);
    usersByEmail.set(organizer.email, organizer);
    vi.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: JWT_SECRET,
          signOptions: { expiresIn: '1h' },
        }),
      ],
      controllers: [AuthController, ProtectedTestController],
      providers: [
        AuthService,
        JwtStrategy,
        { provide: UsersService, useValue: usersService },
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

  it('returns 401 for a role-protected route without a token', async () => {
    await request(app.getHttpServer())
      .get('/api/authorization-test/organizer')
      .expect(401);
  });

  it('returns 403 for a valid token with the wrong role', async () => {
    const token = jwtService.sign({ sub: student.id, email: student.email });

    await request(app.getHttpServer())
      .get('/api/authorization-test/organizer')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  it('continues for a valid token with the permitted role', async () => {
    const token = jwtService.sign({
      sub: organizer.id,
      email: organizer.email,
    });

    await request(app.getHttpServer())
      .get('/api/authorization-test/organizer')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect({ userId: organizer.id, role: 'ORGANIZADOR' });
  });

  it('keeps registration and login accessible without a token', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        firstName: 'Nuevo',
        lastName: 'Estudiante',
        email: 'new-student@example.com',
        password: PASSWORD,
      })
      .expect(201)
      .expect((response) => {
        expect(response.body.accessToken).toBeDefined();
      });

    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: student.email, password: PASSWORD })
      .expect(200)
      .expect((response) => {
        expect(response.body.accessToken).toBeDefined();
      });
  });

  it('keeps profile protected by its local JWT guard', async () => {
    await request(app.getHttpServer()).get('/api/auth/profile').expect(401);

    const token = jwtService.sign({ sub: student.id, email: student.email });
    await request(app.getHttpServer())
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.user.id).toBe(student.id);
        expect(response.body.user.passwordHash).toBeUndefined();
      });
  });
});
