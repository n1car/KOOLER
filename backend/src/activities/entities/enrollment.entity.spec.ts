import 'reflect-metadata';
import { getMetadataArgsStorage } from 'typeorm';
import { ActivityEntity } from './activity.entity';
import { EnrollmentEntity } from './enrollment.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { describe, expect, it } from 'vitest';

const metadata = getMetadataArgsStorage();

describe('EnrollmentEntity metadata', () => {
  // Comprueba que el mapeo de TypeORM conserve la tabla y su clave primaria.
  it('maps to the enrollments table with a generated identifier', () => {
    const table = metadata.tables.find(
      (entry) => entry.target === EnrollmentEntity,
    );
    const generatedId = metadata.generations.find(
      (entry) =>
        entry.target === EnrollmentEntity && entry.propertyName === 'id',
    );
    const idColumn = metadata.columns.find(
      (entry) =>
        entry.target === EnrollmentEntity && entry.propertyName === 'id',
    );

    expect(table?.name).toBe('enrollments');
    expect(generatedId?.strategy).toBe('increment');
    expect(idColumn?.options.name).toBe('id_enrollment');
  });

  it('has required many-to-one relations with user and activity foreign keys', () => {
    const relations = metadata.relations.filter(
      (entry) => entry.target === EnrollmentEntity,
    );

    expect(
      relations.map(({ propertyName, relationType, options }) => ({
        propertyName,
        relationType,
        nullable: options.nullable,
      })),
    ).toEqual([
      { propertyName: 'user', relationType: 'many-to-one', nullable: false },
      {
        propertyName: 'activity',
        relationType: 'many-to-one',
        nullable: false,
      },
    ]);
    expect(
      relations.find((entry) => entry.propertyName === 'user')?.type(),
    ).toBe(UserEntity);
    expect(
      relations.find((entry) => entry.propertyName === 'activity')?.type(),
    ).toBe(ActivityEntity);

    const joinColumns = metadata.joinColumns.filter(
      (entry) => entry.target === EnrollmentEntity,
    );
    expect(
      joinColumns.map(({ propertyName, name }) => ({ propertyName, name })),
    ).toEqual([
      { propertyName: 'user', name: 'id_user' },
      { propertyName: 'activity', name: 'id_activity' },
    ]);
  });

  it('generates the enrollment date and enforces user-activity uniqueness', () => {
    const registrationDate = metadata.columns.find(
      (entry) =>
        entry.target === EnrollmentEntity &&
        entry.propertyName === 'enrollmentDate',
    );
    const uniqueConstraint = metadata.uniques.find(
      (entry) => entry.target === EnrollmentEntity,
    );

    expect(registrationDate?.mode).toBe('createDate');
    expect(registrationDate?.options.name).toBe('enrollment_date');
    expect(uniqueConstraint?.name).toBe('UQ_enrollment_user_activity');
    expect(uniqueConstraint?.columns).toEqual(['user', 'activity']);
  });
});
