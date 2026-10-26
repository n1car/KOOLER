import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ActivityTypeEntity } from '../catalog/entities/activity-type.entity';
import { LocationEntity } from '../catalog/entities/location.entity';
import { RoleEntity } from '../roles/entities/role.entity';
import { UserEntity } from '../users/entities/user.entity';
import { SeedService } from './seed.service';

describe('SeedService', () => {
  let moduleFixture: TestingModule | undefined;

  afterEach(async () => {
    await moduleFixture?.close();
  });

  const createSeedService = async (nodeEnv: string) => {
    const roles: Record<string, unknown>[] = [];
    const users: Record<string, unknown>[] = [];
    const activityTypes: Record<string, unknown>[] = [];
    const locations: Record<string, unknown>[] = [];

    const createRepository = (records: Record<string, unknown>[]) => ({
      create: vi.fn((data: Record<string, unknown>) => data),
      findOneBy: vi.fn(
        async (where: { name?: string; email?: string }) =>
          records.find(
            (record) =>
              (where.name === undefined || record.name === where.name) &&
              (where.email === undefined || record.email === where.email),
          ) ?? null,
      ),
      save: vi.fn(async (record: Record<string, unknown>) => {
        records.push(record);
        return record;
      }),
    });

    const repositories = {
      roles: createRepository(roles),
      users: createRepository(users),
      activityTypes: createRepository(activityTypes),
      locations: createRepository(locations),
    };

    moduleFixture = await Test.createTestingModule({
      providers: [
        SeedService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => (key === 'NODE_ENV' ? nodeEnv : undefined),
          },
        },
        {
          provide: getRepositoryToken(RoleEntity),
          useValue: repositories.roles,
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: repositories.users,
        },
        {
          provide: getRepositoryToken(ActivityTypeEntity),
          useValue: repositories.activityTypes,
        },
        {
          provide: getRepositoryToken(LocationEntity),
          useValue: repositories.locations,
        },
      ],
    }).compile();

    return { seedService: moduleFixture.get(SeedService), repositories };
  };

  // Este entorno debe conservar catálogos y roles sin crear cuentas de demostración.
  it('seeds roles and catalogs but skips demo users in production', async () => {
    const { seedService, repositories } = await createSeedService('production');

    await seedService.onApplicationBootstrap();

    expect(repositories.roles.save).toHaveBeenCalledTimes(2);
    expect(repositories.activityTypes.save).toHaveBeenCalledTimes(4);
    expect(repositories.locations.save).toHaveBeenCalledTimes(6);
    expect(repositories.users.findOneBy).not.toHaveBeenCalled();
    expect(repositories.users.save).not.toHaveBeenCalled();
  });

  // El segundo arranque comprueba que las búsquedas de existencia eviten duplicados.
  it('continues to seed demo users outside production and avoids duplicates', async () => {
    const { seedService, repositories } =
      await createSeedService('development');

    await seedService.onApplicationBootstrap();
    await seedService.onApplicationBootstrap();

    expect(repositories.users.findOneBy).toHaveBeenCalledTimes(4);
    expect(repositories.users.save).toHaveBeenCalledTimes(2);
    expect(repositories.roles.save).toHaveBeenCalledTimes(2);
    expect(repositories.activityTypes.save).toHaveBeenCalledTimes(4);
    expect(repositories.locations.save).toHaveBeenCalledTimes(6);
  });
});
