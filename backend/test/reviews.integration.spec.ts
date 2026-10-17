import { describe, it, beforeAll, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication, ExecutionContext, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard';

describe('Reviews: integración de permisos', () => {
  let app: INestApplication;
  let currentUser: any = { id: 1, role: { name: 'ORGANIZADOR' } };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
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

  afterAll(() => app.close());

  it('un organizador no puede calificar (403)', async () => {
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