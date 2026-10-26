import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CertificatesService } from '../certificates/certificates.service';
import { ActivityEntity } from './entities/activity.entity';
import { ActivityFinalizationService } from './activity-finalization.service';

describe('ActivityFinalizationService', () => {
  let service: ActivityFinalizationService;
  let activityRepository: { query: ReturnType<typeof vi.fn> };
  let certificatesService: {
    issueEligibleCertificates: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    activityRepository = {
      query: vi.fn(),
    };
    certificatesService = {
      issueEligibleCertificates: vi.fn().mockResolvedValue({
        activityId: 1,
        eligibleStudents: 0,
        issuedCertificates: 0,
        existingCertificates: 0,
        failedStudents: 0,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityFinalizationService,
        {
          provide: getRepositoryToken(ActivityEntity),
          useValue: activityRepository,
        },
        { provide: CertificatesService, useValue: certificatesService },
      ],
    }).compile();

    service = module.get(ActivityFinalizationService);
  });

  it('finalizes only ACTIVE activities whose local end date and time passed', async () => {
    activityRepository.query
      .mockResolvedValueOnce([{ id_activity: 1 }])
      .mockResolvedValueOnce([{ id: 1 }]);

    await service.finalizeExpiredActivities();

    const [updateQuery, parameters] =
      activityRepository.query.mock.calls[0];
    expect(updateQuery).toContain("activity.status = 'ACTIVE'");
    expect(updateQuery).toContain(
      "WHEN end_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$'",
    );
    expect(updateQuery).toContain(
      'THEN ((date + end_time::time) AT TIME ZONE $1)',
    );
    expect(updateQuery).toContain('ELSE FALSE');
    expect(updateQuery).toContain('<= CURRENT_TIMESTAMP');
    expect(updateQuery).toContain('ORDER BY id_activity');
    expect(updateQuery).toContain('LIMIT $2');
    expect(updateQuery).toContain('FOR UPDATE SKIP LOCKED');
    expect(updateQuery).toContain(
      'WHERE activity.id_activity = candidates.id_activity',
    );
    expect(updateQuery).toContain('RETURNING activity.id_activity');
    expect(parameters).toEqual(['America/Bogota', 50]);
    expect(certificatesService.issueEligibleCertificates).toHaveBeenCalledWith(
      1,
    );
  });

  // Las actividades canceladas y las que aún no terminan no deben avanzar al flujo de emisión.
  it('does not issue certificates for cancelled activities', async () => {
    activityRepository.query
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    await service.finalizeExpiredActivities();

    const updateQuery = activityRepository.query.mock.calls[0][0];
    expect(updateQuery).toContain("activity.status = 'ACTIVE'");
    expect(certificatesService.issueEligibleCertificates).not.toHaveBeenCalled();
  });

  it('does not finalize a future activity before its local end time', async () => {
    activityRepository.query
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    await service.finalizeExpiredActivities();

    const updateQuery = activityRepository.query.mock.calls[0][0];
    expect(updateQuery).toContain('<= CURRENT_TIMESTAMP');
    expect(certificatesService.issueEligibleCertificates).not.toHaveBeenCalled();
  });

  // Los ciclos siguientes también sirven para recuperar emisiones que fallaron antes.
  it('reprocesses finished activities on repeated cycles for safe issuance retries', async () => {
    activityRepository.query
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 8 }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 8 }]);

    await service.finalizeExpiredActivities();
    await service.finalizeExpiredActivities();

    expect(certificatesService.issueEligibleCertificates).toHaveBeenCalledTimes(
      2,
    );
    expect(certificatesService.issueEligibleCertificates).toHaveBeenCalledWith(
      8,
    );
  });

  it('continues to later activities after an activity-level issuance error', async () => {
    activityRepository.query
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 1 }, { id: 2 }]);
    certificatesService.issueEligibleCertificates
      .mockRejectedValueOnce(new Error('Temporary persistence failure'))
      .mockResolvedValueOnce({
        activityId: 2,
        eligibleStudents: 1,
        issuedCertificates: 1,
        existingCertificates: 0,
        failedStudents: 0,
      });

    await service.finalizeExpiredActivities();

    expect(certificatesService.issueEligibleCertificates).toHaveBeenCalledTimes(
      2,
    );
  });

  it('continues paging in bounded batches', async () => {
    const firstPage = Array.from({ length: 50 }, (_, index) => ({
      id: index + 1,
    }));
    activityRepository.query
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(firstPage)
      .mockResolvedValueOnce([{ id: 51 }]);

    await service.finalizeExpiredActivities();

    expect(activityRepository.query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('LIMIT $1 OFFSET $2'),
      [50, 0],
    );
    expect(activityRepository.query).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining('LIMIT $1 OFFSET $2'),
      [50, 50],
    );
    expect(certificatesService.issueEligibleCertificates).toHaveBeenCalledTimes(
      51,
    );
  });
});
