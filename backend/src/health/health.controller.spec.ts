import { ServiceUnavailableException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { describe, expect, it, vi } from 'vitest';
import { HealthController } from './health.controller.js';

function buildController(query: () => Promise<unknown>) {
  return new HealthController({ query } as unknown as DataSource);
}

describe('HealthController', () => {
  it('reporta estado ok cuando la base de datos responde', async () => {
    const controller = buildController(vi.fn().mockResolvedValue([{ ok: 1 }]));

    const result = await controller.check();

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
