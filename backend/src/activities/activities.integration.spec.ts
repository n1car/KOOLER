import { CanActivate, ExecutionContext, Injectable, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { describe, beforeAll, afterAll, it, expect } from 'vitest';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { ActivityEntity } from './entities/activity.entity';
import { EnrollmentEntity } from './entities/enrollment.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

// Usuario activo para el guard mockeado (se cambia por escenario).
let currentUser: any = null;

@Injectable()
class AllowGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    context.switchToHttp().getRequest().user = currentUser;
    return true;
  }
}

// Repos en memoria con estado compartido: permiten probar el flujo
// crear -> inscribir -> duplicado -> sin cupo de punta a punta.
function buildInMemoryState() {
  const activities: any[] = [];
  const enrollments: any[] = [];
  let activitySeq = 0;
  let enrollmentSeq = 0;

  const activityRepo = {
    create: (dto: any) => ({ id: ++activitySeq, ...dto }),
    save: async (act: any) => {
      const idx = activities.findIndex((a) => a.id === act.id);
      if (idx >= 0) activities[idx] = act;
      else activities.push(act);
      return act;
    },
    find: async () =>
      activities.map((a) => ({
        ...a,
        enrollments: enrollments.filter((e) => e.activity.id === a.id),
      })),
    findOne: async ({ where }: any) => {
      const found = activities.find((a) => a.id === where.id);
      if (!found) return null;
      return {
        ...found,
        enrollments: enrollments.filter((e) => e.activity.id === found.id),
      };
    },
  };

  const enrollmentRepo = {
    create: (dto: any) => ({ id: ++enrollmentSeq, enrollmentDate: new Date(), ...dto }),
    save: async (enr: any) => {
      enrollments.push(enr);
      return enr;
    },
    find: async ({ where }: any) =>
      enrollments.filter((e) => !where?.user || e.user.id === where.user.id),
    findOne: async ({ where }: any) =>
      enrollments.find(
        (e) => e.activity.id === where.activity.id && e.user.id === where.user.id,
      ) ?? null,
    count: async ({ where }: any) =>
      enrollments.filter((e) => e.activity.id === where.activity.id).length,
  };

  const dataSource = {
    transaction: async (cb: any) =>
      cb({
        getRepository: (entity: any) =>
          entity === ActivityEntity ? activityRepo : enrollmentRepo,
      }),
  };

  return { activityRepo, enrollmentRepo, dataSource };
}

describe('Activities flow (integración sin BD)', () => {
  let app: any;

  const organizer = { id: 1, email: 'org@icesi.edu.co', role: { name: 'ORGANIZADOR' } };
  const studentA = { id: 2, email: 'a@icesi.edu.co', role: { name: 'ESTUDIANTE' } };
  const studentB = { id: 3, email: 'b@icesi.edu.co', role: { name: 'ESTUDIANTE' } };
  const studentC = { id: 4, email: 'c@icesi.edu.co', role: { name: 'ESTUDIANTE' } };

  beforeAll(async () => {
    const { activityRepo, enrollmentRepo, dataSource } = buildInMemoryState();

    const moduleRef = await Test.createTestingModule({
      controllers: [ActivitiesController],
      providers: [
        ActivitiesService,
        { provide: getRepositoryToken(ActivityEntity), useValue: activityRepo },
        { provide: getRepositoryToken(EnrollmentEntity), useValue: enrollmentRepo },
        { provide: DataSource, useValue: dataSource },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(new AllowGuard())
      .overrideGuard(RolesGuard)
      .useValue(new AllowGuard())
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('flujo completo: crear -> inscribir -> duplicado bloqueado -> cupo agotado', async () => {
    currentUser = organizer;
    const created = await request(app.getHttpServer())
      .post('/api/activities')
      .send({
        name: 'Torneo relámpago',
        description: 'Fútbol 5',
        date: '2026-11-20',
        startTime: '10:00',
        endTime: '12:00',
        capacity: 2,
        registrationDeadline: '2026-11-19T23:59:59.000Z',
      })
      .expect(201);
    const activityId = created.body.id;
    expect(activityId).toBeDefined();

    currentUser = studentA;
    await request(app.getHttpServer()).post(`/api/activities/${activityId}/enroll`).expect(200);

    // Duplicado: el mismo estudiante no puede inscribirse dos veces.
    await request(app.getHttpServer()).post(`/api/activities/${activityId}/enroll`).expect(400);

    currentUser = studentB;
    await request(app.getHttpServer()).post(`/api/activities/${activityId}/enroll`).expect(200);

    // Cupo agotado (2/2): el tercer estudiante es rechazado.
    currentUser = studentC;
    await request(app.getHttpServer()).post(`/api/activities/${activityId}/enroll`).expect(400);

    // El listado refleja los cupos consumidos.
    const list = await request(app.getHttpServer()).get('/api/activities').expect(200);
    const shown = list.body.find((a: any) => a.id === activityId);
    expect(shown.availableSpots).toBe(0);
    expect(shown.enrolledCount).toBe(2);
  });
});
