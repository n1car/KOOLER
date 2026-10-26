import { describe, it, expect, vi } from 'vitest';
import { ForbiddenException } from '@nestjs/common';
import { ReviewsService } from './reviews.service';

function makeService(activity: any, rows: any[] = []) {
  const reviewRepo = {
    createQueryBuilder: () => ({
      select() { return this; },
      addSelect() { return this; },
      where() { return this; },
      getRawOne: async () => ({ avg: '4.5', total: '2' }),
    }),
    find: vi.fn(async () => rows),
  };
  const activityRepo = { findOne: vi.fn(async () => activity) };
  return new ReviewsService(reviewRepo as any, activityRepo as any, {} as any);
}

describe('ReviewsService: organizador y privacidad', () => {
  // La lectura de retroalimentación queda restringida al organizador propietario.
  it('rechaza a un organizador que no es dueño', async () => {
    const service = makeService({ id: 10, organizer: { id: 99 } });
    await expect(service.findForOrganizer(1, 10)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('nunca expone datos sensibles del usuario', async () => {
    const service = makeService({ id: 10, organizer: { id: 1 } }, [{
      id: 1, rating: 5, comment: 'Excelente', date: new Date(),
      user: { firstName: 'Ana', passwordHash: 'secreto', email: 'a@icesi.edu.co' },
    }]);
    const result = await service.findForOrganizer(1, 10);
    expect(result.items[0]).toEqual({
      id: 1, rating: 5, comment: 'Excelente', date: expect.any(Date), author: 'Ana',
    });
    expect(JSON.stringify(result)).not.toContain('secreto');
  });
});