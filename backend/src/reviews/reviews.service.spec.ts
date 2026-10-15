import { describe, it, expect, vi } from 'vitest';
import {
  BadRequestException, ConflictException, ForbiddenException, NotFoundException,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';

function setup() {
  const reviewRepo = {
    create: vi.fn((x) => x),
    save: vi.fn(async (x) => ({ id: 1, ...x })),
  };
  const activityRepo = { findOne: vi.fn() };
  const attendanceRepo = { findOne: vi.fn() };
  const service = new ReviewsService(reviewRepo as any, activityRepo as any, attendanceRepo as any);
  return { service, reviewRepo, activityRepo, attendanceRepo };
}

const student = { id: 1 };
const dto = { activityId: 10, rating: 4, comment: 'Buena' };

describe('ReviewsService.create', () => {
  it('lanza NotFound si la actividad no existe', async () => {
    const { service, activityRepo } = setup();
    activityRepo.findOne.mockResolvedValue(null);
    await expect(service.create(student, dto)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('no permite calificar una actividad que aún no termina', async () => {
    const { service, activityRepo } = setup();
    activityRepo.findOne.mockResolvedValue({ id: 10, status: 'ACTIVE', date: '2099-01-01', endTime: '10:00' });
    await expect(service.create(student, dto)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('no permite calificar sin asistencia PRESENT', async () => {
    const { service, activityRepo, attendanceRepo } = setup();
    activityRepo.findOne.mockResolvedValue({ id: 10, status: 'FINISHED' });
    attendanceRepo.findOne.mockResolvedValue(null);
    await expect(service.create(student, dto)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('guarda la reseña cuando la actividad está FINISHED y hay asistencia', async () => {
    const { service, activityRepo, attendanceRepo, reviewRepo } = setup();
    activityRepo.findOne.mockResolvedValue({ id: 10, status: 'FINISHED' });
    attendanceRepo.findOne.mockResolvedValue({ status: 'PRESENT' });
    const result = await service.create(student, dto);
    expect(reviewRepo.save).toHaveBeenCalledOnce();
    expect(result).toMatchObject({ idUser: 1, idActivity: 10, rating: 4 });
  });

  it('acepta una actividad ACTIVE cuyo horario ya pasó (RF09)', async () => {
    const { service, activityRepo, attendanceRepo, reviewRepo } = setup();
    activityRepo.findOne.mockResolvedValue({ id: 10, status: 'ACTIVE', date: '2020-01-01', endTime: '10:00' });
    attendanceRepo.findOne.mockResolvedValue({ status: 'PRESENT' });
    await service.create(student, dto);
    expect(reviewRepo.save).toHaveBeenCalledOnce();
  });

  it('traduce la violación de UNIQUE a Conflict (doble envío)', async () => {
    const { service, activityRepo, attendanceRepo, reviewRepo } = setup();
    activityRepo.findOne.mockResolvedValue({ id: 10, status: 'FINISHED' });
    attendanceRepo.findOne.mockResolvedValue({ status: 'PRESENT' });
    reviewRepo.save.mockRejectedValue(Object.assign(new Error('dup'), { code: '23505' }));
    await expect(service.create(student, dto)).rejects.toBeInstanceOf(ConflictException);
  });
});