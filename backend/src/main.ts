import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefijo global '/api' (igual que en el repo del profesor)
  app.setGlobalPrefix('api');

  // Permitir peticiones desde el frontend (Next.js)
  app.enableCors();

  // Validación automática de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Interceptor de logging (requisito D2 justificado para auditoría y métricas)
  app.useGlobalInterceptors(new LoggingInterceptor());

  // NOTA: RolesGuard NO va global. Cada ruta protegida ya declara
  // @UseGuards(JwtAuthGuard, RolesGuard): el global corría antes que
  // JwtAuthGuard, veía request.user vacío y devolvía 403 siempre.

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Kooler Backend corriendo en: http://localhost:${port}/api`);
}
bootstrap();
