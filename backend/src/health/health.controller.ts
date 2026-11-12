import {
  Controller,
  Get,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';

/**
 * Health check usado por el proveedor de despliegue y por el smoke test.
 * Comprueba que el proceso responde y que la base de datos acepta consultas.
 */
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);
  private databaseDiagnosticsLogged = false;

  constructor(private readonly dataSource: DataSource) {}

  @Get()
  async check() {
    const checkedAt = new Date().toISOString();

    try {
      if (!this.databaseDiagnosticsLogged) {
        const [database] = (await this.dataSource.query(
          `SELECT current_database() AS database_name,
                  current_setting('TimeZone') AS database_time_zone,
                  CURRENT_TIMESTAMP AS database_now`,
        )) as Array<{
          database_name: string;
          database_time_zone: string;
          database_now: Date | string;
        }>;
        const connectionSource = process.env.DATABASE_URL_UNPOOLED?.trim()
          ? 'DATABASE_URL_UNPOOLED'
          : process.env.DATABASE_URL?.trim()
            ? 'DATABASE_URL'
            : 'DB_HOST/DB_DATABASE';
        const now = new Date();
        this.logger.warn(
          `[DB_TRACE] ${JSON.stringify({
            renderServiceName: process.env.RENDER_SERVICE_NAME,
            renderGitCommit: process.env.RENDER_GIT_COMMIT,
            connectionSource,
            databaseName: database.database_name,
            databaseTimeZone: database.database_time_zone,
            databaseNow: database.database_now,
            processTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            processUtcNow: now.toISOString(),
            processColombiaNow: new Intl.DateTimeFormat('sv-SE', {
              timeZone: 'America/Bogota',
              dateStyle: 'short',
              timeStyle: 'medium',
              hourCycle: 'h23',
            }).format(now),
          })}`,
        );
        this.databaseDiagnosticsLogged = true;
      } else {
        await this.dataSource.query('SELECT 1');
      }
    } catch {
      throw new ServiceUnavailableException({
        status: 'error',
        database: 'down',
        checkedAt,
      });
    }

    return {
      status: 'ok',
      database: 'up',
      uptimeSeconds: Math.round(process.uptime()),
      checkedAt,
    };
  }
}
