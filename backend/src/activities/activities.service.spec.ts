import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EnrollmentEntity } from './entities/enrollment.entity';
import { ActivitiesService } from './activities.service';

describe('ActivitiesService', () => {
  let service: ActivitiesService;
  let enrollmentsRepository: { findOneBy: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    enrollmentsRepository = { findOneBy: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivitiesService,
        {
          provide: getRepositoryToken(EnrollmentEntity),
          useValue: enrollmentsRepository,
        },
      ],
    }).compile();

    service = module.get(ActivitiesService);
  });

  it('returns true when the student is enrolled in the activity', async () => {
    enrollmentsRepository.findOneBy.mockResolvedValue({
      id: 1,
      activity: { id: 10 },
      user: { id: 2 },
    });

    await expect(service.isStudentEnrolled(10, 2)).resolves.toBe(true);
    expect(enrollmentsRepository.findOneBy).toHaveBeenCalledWith({
      activity: { id: 10 },
      user: { id: 2 },
    });
  });

  it('returns false when no enrollment exists for the student and activity', async () => {
    enrollmentsRepository.findOneBy.mockResolvedValue(null);

    await expect(service.isStudentEnrolled(10, 2)).resolves.toBe(false);
    expect(enrollmentsRepository.findOneBy).toHaveBeenCalledWith({
      activity: { id: 10 },
      user: { id: 2 },
    });
  });

  it('propagates repository errors', async () => {
    const repositoryError = new Error('Database unavailable');
    enrollmentsRepository.findOneBy.mockRejectedValue(repositoryError);

    await expect(service.isStudentEnrolled(10, 2)).rejects.toBe(
      repositoryError,
    );
  });
});
