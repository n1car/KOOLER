import { ServiceUnavailableException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { describe, expect, it, vi } from 'vitest';
import { HealthController } from './health.controller.js';

function buildController(query: () => Promise<unknown>) {
  return new HealthController({ query } as unknown as DataSource);
}

describe('HealthController', () => {
  // La ruta solo informa disponibilidad completa si la consulta a PostgreSQL responde.
  it('reporta estado ok cuando la base de datos responde', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce([
        {
          database_name: 'kooler_test',
          database_time_zone: 'UTC',
          database_now: new Date('2026-11-12T09:30:00.000Z'),
          database_colombia_now: '2026-11-12 04:30:00',
        },
      ])
      .mockResolvedValueOnce([
        {
          column_name: 'date',
          data_type: 'date',
          udt_name: 'date',
        },
        {
          column_name: 'end_time',
          data_type: 'character varying',
          udt_name: 'varchar',
        },
      ])
      .mockResolvedValueOnce([
        {
          id_activity: 9,
          activity_date: '2026-11-12',
          end_time: '07:00',
          cron_would_finalize: false,
        },
      ])
      .mockResolvedValueOnce([
        {
          local_end: '2026-11-12 05:00:00',
          end_instant: '2026-11-12T10:00:00.000Z',
          reference_now: '2026-11-12T09:41:00.000Z',
          expired: false,
        },
      ]);
    const controller = buildController(query);

    const result = await controller.check();

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('current_database()'),
    );
    expect(query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('information_schema.columns'),
      undefined,
    );
    expect(query).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining('cron_would_finalize'),
      ['America/Bogota', 9],
    );
    expect(query).toHaveBeenNthCalledWith(
      4,
      expect.stringContaining("TIME '05:00'"),
      undefined,
    );
    expect(result.status).toBe('ok');
    expect(result.database).toBe('up');
    expect(result.uptimeSeconds).toBeGreaterThanOrEqual(0);
    expect(typeof result.checkedAt).toBe('string');

    await controller.check();
    expect(query).toHaveBeenCalledTimes(5);
    expect(query).toHaveBeenLastCalledWith('SELECT 1');
  });

  it('responde 503 cuando la base de datos falla', async () => {
    const controller = buildController(
      vi.fn().mockRejectedValue(new Error('connection refused')),
    );

    await expect(controller.check()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
