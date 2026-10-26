import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';

// Requiere Docker levantado: `docker compose up -d` (Postgres 17 en 5433).
// Cubre el arranque real con prefijo global /api y seed de demo.
describe('App (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  it('/api (GET) responde sin tumbar el bootstrap', () => {
    return request(app.getHttpServer()).get('/api').expect(404);
  });

  it('/api/auth/login responde 401 con credenciales falsas', () => {
    return request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'nadie@icesi.edu.co', password: 'wrong' })
      .expect(401);
  });

  it('/api/health responde 200 con la base de datos conectada', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/health')
      .expect(200);

    expect(response.body).toMatchObject({ status: 'ok', database: 'up' });
  });

  afterAll(async () => {
    await app.close();
  });
});
