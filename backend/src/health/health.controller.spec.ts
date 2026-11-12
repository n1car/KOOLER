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
    const query = vi.fn().mockResolvedValue([
      {
        database_name: 'kooler_test',
        database_time_zone: 'UTC',
        database_now: new Date('2026-11-12T09:30:00.000Z'),
      },
    ]);
    const controller = buildController(query);

    const result = await controller.check();

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('current_database()'),
    );
    expect(result.status).toBe('ok');
    expect(result.database).toBe('up');
    expect(result.uptimeSeconds).toBeGreaterThanOrEqual(0);
    expect(typeof result.checkedAt).toBe('string');
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
