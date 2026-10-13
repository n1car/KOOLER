import { ConflictException, InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryFailedError } from 'typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CertificateEntity } from './entities/certificate.entity';
import { CertificatesService } from './certificates.service';

const createCertificate = (id = 1, studentId = 10, activityId = 20) => ({
  id,
  user: { id: studentId },
  activity: { id: activityId },
  issueDate: new Date('2026-10-02T12:00:00Z'),
  certificateCode: `CERT-${studentId}-${activityId}`,
});

describe('CertificatesService', () => {
  let service: CertificatesService;
  let certificateRepository: {
    find: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    certificateRepository = {
      find: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CertificatesService,
        {
          provide: getRepositoryToken(CertificateEntity),
          useValue: certificateRepository,
        },
      ],
    }).compile();

    service = module.get(CertificatesService);
  });

  it('devuelve certificados del estudiante actual ordenados por fecha', async () => {
    const cert = createCertificate();
    certificateRepository.find.mockResolvedValue([cert]);

    await expect(service.findByStudentId(10)).resolves.toEqual([cert]);
    expect(certificateRepository.find).toHaveBeenCalledWith({
      where: { user: { id: 10 } },
      relations: { activity: true, user: true },
      order: { issueDate: 'DESC' },
    });
  });

  it('lanza conflicto si ya existe un certificado para la misma pareja usuario-actividad', async () => {
    certificateRepository.findOne.mockResolvedValue(createCertificate());

    await expect(service.issueCertificate(10, 20)).rejects.toThrow(ConflictException);
  });

  it('genera un código único y guarda el certificado', async () => {
    const cert = createCertificate();
    certificateRepository.findOne.mockResolvedValue(null);
    certificateRepository.create.mockReturnValue(cert);
    certificateRepository.save.mockResolvedValue(cert);

    await expect(service.issueCertificate(10, 20)).resolves.toBe(cert);
    expect(certificateRepository.create).toHaveBeenCalledWith({
      user: { id: 10 },
      activity: { id: 20 },
      certificateCode: expect.any(String),
    });
  });

  it('propaga conflictos de código duplicado al guardar', async () => {
    certificateRepository.findOne.mockResolvedValue(null);
    certificateRepository.create.mockReturnValue({
      user: { id: 10 },
      activity: { id: 20 },
      certificateCode: 'DUPLICATE',
    });
    certificateRepository.save.mockRejectedValue(
      new QueryFailedError('INSERT INTO certificates', [], {
        code: '23505',
      }),
    );

    await expect(service.issueCertificate(10, 20)).rejects.toThrow(ConflictException);
  });

  it('envuelve errores de persistencia no duplicados', async () => {
    certificateRepository.findOne.mockResolvedValue(null);
    certificateRepository.create.mockReturnValue({
      user: { id: 10 },
      activity: { id: 20 },
      certificateCode: 'OK',
    });
    certificateRepository.save.mockRejectedValue(new Error('DB unavailable'));

    await expect(service.issueCertificate(10, 20)).rejects.toThrow(
      InternalServerErrorException,
    );
  });
});
