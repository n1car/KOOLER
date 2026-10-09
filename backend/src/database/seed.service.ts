import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RoleEntity } from '../roles/entities/role.entity';
import { UserEntity } from '../users/entities/user.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedRoles();
    await this.seedDemoUsers();
  }

  private async seedRoles() {
    const roles = ['ESTUDIANTE', 'ORGANIZADOR'];
    for (const roleName of roles) {
      const exists = await this.roleRepo.findOneBy({ name: roleName });
      if (!exists) {
        await this.roleRepo.save(this.roleRepo.create({ name: roleName }));
        this.logger.log(`Rol creado: ${roleName}`);
      }
    }
  }

  private async seedDemoUsers() {
    const studentRole = await this.roleRepo.findOneBy({ name: 'ESTUDIANTE' });
    const organizerRole = await this.roleRepo.findOneBy({ name: 'ORGANIZADOR' });

    if (!studentRole || !organizerRole) return;

    // 1. Estudiante Demo
    const studentEmail = 'estudiante@icesi.edu.co';
    const studentExists = await this.userRepo.findOneBy({ email: studentEmail });
    if (!studentExists) {
      const passwordHash = await bcrypt.hash('Password123!', 10);
      await this.userRepo.save(
        this.userRepo.create({
          firstName: 'Juan',
          lastName: 'Estudiante',
          email: studentEmail,
          passwordHash,
          role: studentRole,
          status: 'ACTIVE',
        }),
      );
      this.logger.log(`Usuario estudiante demo creado: ${studentEmail}`);
    }

    // 2. Organizador Demo
    const organizerEmail = 'organizador@icesi.edu.co';
    const organizerExists = await this.userRepo.findOneBy({ email: organizerEmail });
    if (!organizerExists) {
      const passwordHash = await bcrypt.hash('Password123!', 10);
      await this.userRepo.save(
        this.userRepo.create({
          firstName: 'Laura',
          lastName: 'Organizadora',
          email: organizerEmail,
          passwordHash,
          role: organizerRole,
          status: 'ACTIVE',
        }),
      );
      this.logger.log(`Usuario organizador demo creado: ${organizerEmail}`);
    }
  }
}
