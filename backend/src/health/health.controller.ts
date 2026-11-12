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

  private async runDiagnosticQuery(
    name: string,
    sql: string,
    parameters?: unknown[],
  ): Promise<{ name: string; rows?: unknown; error?: { name: string; code?: string } }> {
    try {
      return {
        name,
        rows: await this.dataSource.query(sql, parameters),
      };
    } catch (error) {
      const code =
        typeof error === 'object' && error !== null && 'code' in error
          ? String(error.code)
          : undefined;
      const detail = {
        name: error instanceof Error ? error.name : 'UnknownError',
        ...(code ? { code } : {}),
      };
      this.logger.error(
        `[DB_TRACE] diagnostic query "${name}" failed: ${JSON.stringify(detail)}`,
      );
      return { name, error: detail };
    }
  }

  private async logDatabaseDiagnostics(): Promise<void> {
    const [database] = (await this.dataSource.query(
      `SELECT current_database() AS database_name,
              current_setting('TimeZone') AS database_time_zone,
              CURRENT_TIMESTAMP AS database_now,
              to_char(
                CURRENT_TIMESTAMP AT TIME ZONE 'America/Bogota',
                'YYYY-MM-DD HH24:MI:SS.US'
              ) AS database_colombia_now`,
    )) as Array<{
      database_name: string;
      database_time_zone: string;
      database_now: Date | string;
      database_colombia_now: string;
    }>;
    const connectionSource = process.env.DATABASE_URL_UNPOOLED?.trim()
      ? 'DATABASE_URL_UNPOOLED'
      : process.env.DATABASE_URL?.trim()
        ? 'DATABASE_URL'
        : 'DB_HOST/DB_DATABASE';
    const columns = await this.runDiagnosticQuery(
      'activity-column-types',
      `SELECT table_schema, column_name, data_type, udt_name,
              character_maximum_length
       FROM information_schema.columns
       WHERE table_name = 'activities'
         AND column_name IN ('date', 'end_time')
       ORDER BY table_schema, column_name`,
    );
    const activity = await this.runDiagnosticQuery(
      'activity-9-finalization-expression',
      `SELECT id_activity,
              date::text AS activity_date,
              end_time::text AS end_time,
              pg_typeof(date)::text AS date_type,
              pg_typeof(end_time)::text AS end_time_type,
              pg_typeof(date + end_time::time)::text AS local_end_type,
              pg_typeof((date + end_time::time) AT TIME ZONE $1)::text
                AS end_instant_type,
              pg_typeof(CURRENT_TIMESTAMP AT TIME ZONE $1)::text
                AS database_colombia_now_type,
              to_char(date + end_time::time, 'YYYY-MM-DD HH24:MI:SS')
                AS local_end,
              (date + end_time::time) AT TIME ZONE $1 AS end_instant,
              CURRENT_TIMESTAMP AS database_now,
              to_char(CURRENT_TIMESTAMP AT TIME ZONE $1,
                'YYYY-MM-DD HH24:MI:SS.US') AS database_colombia_now,
              ((date + end_time::time) AT TIME ZONE $1)
                <= CURRENT_TIMESTAMP AS prior_cron_comparison,
              CASE
                WHEN end_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$'
                  THEN (date + end_time::time)
                    <= (CURRENT_TIMESTAMP AT TIME ZONE $1)
                ELSE FALSE
              END AS cron_would_finalize
       FROM activities
       WHERE id_activity = $2`,
      ['America/Bogota', 9],
    );
    const fiveAmReproduction = await this.runDiagnosticQuery(
      'same-day-05-vs-0441-colombia',
      `WITH sample AS (
         SELECT DATE '2026-11-12' AS activity_date,
                TIME '05:00' AS end_time,
                TIMESTAMPTZ '2026-11-12 09:41:00+00' AS reference_now
       )
       SELECT pg_typeof(activity_date + end_time)::text AS local_end_type,
              pg_typeof((activity_date + end_time)
                AT TIME ZONE 'America/Bogota')::text AS end_instant_type,
              pg_typeof(reference_now)::text AS reference_now_type,
              to_char(activity_date + end_time,
                'YYYY-MM-DD HH24:MI:SS') AS local_end,
              (activity_date + end_time)
                AT TIME ZONE 'America/Bogota' AS end_instant,
              reference_now,
              ((activity_date + end_time)
                AT TIME ZONE 'America/Bogota') <= reference_now
                AS expired`,
    );
    const now = new Date();
    this.logger.warn(
      `[DB_TRACE] ${JSON.stringify({
        renderServiceName: process.env.RENDER_SERVICE_NAME,
        renderGitCommit: process.env.RENDER_GIT_COMMIT,
        connectionSource,
        databaseName: database.database_name,
        databaseTimeZone: database.database_time_zone,
        databaseNow: database.database_now,
        databaseColombiaNow: database.database_colombia_now,
        processTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        processUtcNow: now.toISOString(),
        processColombiaNow: new Intl.DateTimeFormat('sv-SE', {
          timeZone: 'America/Bogota',
          dateStyle: 'short',
          timeStyle: 'medium',
          hourCycle: 'h23',
        }).format(now),
        columns,
        activity9: activity,
        fiveAmReproduction,
      })}`,
    );
  }

  @Get()
  async check() {
    const checkedAt = new Date().toISOString();

    try {
      if (!this.databaseDiagnosticsLogged) {
        await this.logDatabaseDiagnostics();
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
