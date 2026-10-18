import { describe, it, beforeAll, afterAll, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication, ExecutionContext, ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { ReviewsController } from '../src/reviews/reviews.controller';
import { ReviewsService } from '../src/reviews/reviews.service';
import { ReviewEntity } from '../src/reviews/entities/review.entity';
import { ActivityEntity } from '../src/activities/entities/activity.entity';
import { AttendanceEntity } from '../src/attendance/entities/attendance.entity';
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard';

// Integración de permisos sin BD: se monta el ReviewsController real con el
// JwtAuthGuard sobrescrito para inyectar el usuario y se conserva el RolesGuard
// real para validar la autorización por rol. Los repositorios están mockeados.
describe('Reviews: integración de permisos', () => {
  let app: INestApplication;
  let currentUser: any = { id: 1, role: { name: 'ORGANIZADOR' } };

  beforeAll(async () => {
    const reviewRepo = {
      create: (data: any) => data,
      save: vi.fn(async (entity: any) => entity),
      find: vi.fn(async () => []),
      createQueryBuilder: () => ({
        select() { return this; },
        addSelect() { return this; },
        where() { return this; },
        getRawOne: async () => ({ avg: null, total: '0' }),
      }),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [
        ReviewsService,
        { provide: getRepositoryToken(ReviewEntity), useValue: reviewRepo },
        { provide: getRepositoryToken(ActivityEntity), useValue: { findOne: vi.fn(async () => null) } },
        { provide: getRepositoryToken(AttendanceEntity), useValue: { findOne: vi.fn(async () => null) } },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          ctx.switchToHttp().getRequest().user = currentUser;
          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    // main.ts no corre en tests: el ValidationPipe se registra aquí para que el 400 funcione
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => app.close());

  it('un organizador no puede calificar (403)', async () => {
    currentUser = { id: 1, role: { name: 'ORGANIZADOR' } };
    await request(app.getHttpServer())
      .post('/api/reviews')
      .send({ activityId: 1, rating: 5 })
      .expect(403);
  });

  it('rechaza una calificación fuera de rango (400)', async () => {
    currentUser = { id: 2, role: { name: 'ESTUDIANTE' } };
    await request(app.getHttpServer())
      .post('/api/reviews')
      .send({ activityId: 1, rating: 9 })
      .expect(400);
  });
});
