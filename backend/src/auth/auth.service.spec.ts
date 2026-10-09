import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';
import { vi, describe, beforeEach, it, expect } from 'vitest';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;

  beforeEach(async () => {
    usersService = {
      findByEmail: vi.fn(),
      create: vi.fn(),
    };
    jwtService = {
      sign: vi.fn().mockReturnValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  it('debe lanzar BadRequestException si el correo ya existe al registrarse', async () => {
    (usersService.findByEmail as any).mockResolvedValue({ id: 1, email: 'test@icesi.edu.co' });

    await expect(
      service.register({
        firstName: 'Nico',
        lastName: 'Prueba',
        email: 'test@icesi.edu.co',
        password: 'Password123!',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
