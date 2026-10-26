import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RoleEntity } from '../roles/entities/role.entity';
import { UserEntity } from '../users/entities/user.entity';
import { ActivityTypeEntity } from '../catalog/entities/activity-type.entity';
import { LocationEntity } from '../catalog/entities/location.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(ActivityTypeEntity)
    private readonly activityTypeRepo: Repository<ActivityTypeEntity>,
    @InjectRepository(LocationEntity)
    private readonly locationRepo: Repository<LocationEntity>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedRoles();
    if (this.configService.get<string>('NODE_ENV') !== 'production') {
      await this.seedDemoUsers();
    }
    await this.seedActivityTypes();
    await this.seedLocations();
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

  private async seedActivityTypes() {
    const types: Array<{ name: string; requiresEnrollment: boolean }> = [
      { name: 'Deportiva', requiresEnrollment: true },
      { name: 'Cultural', requiresEnrollment: true },
      { name: 'Taller', requiresEnrollment: true },
      { name: 'Recreativa', requiresEnrollment: true },
    ];

    for (const type of types) {
      const exists = await this.activityTypeRepo.findOneBy({ name: type.name });
      if (!exists) {
        await this.activityTypeRepo.save(this.activityTypeRepo.create(type));
        this.logger.log(`Categoría creada: ${type.name}`);
      }
    }
  }

  private async seedLocations() {
    const locations: Array<{ name: string; building: string }> = [
      { name: 'Auditorio Varela', building: 'Edificio Central' },
      { name: 'Cancha 1', building: 'Zona Deportiva' },
      { name: 'Coliseo', building: 'Zona Deportiva' },
      { name: 'Biblioteca', building: 'Edificio Central' },
      { name: 'Sala de Música', building: 'Bloque C' },
      { name: 'Piscina', building: 'Zona Deportiva' },
    ];

    for (const location of locations) {
      const exists = await this.locationRepo.findOneBy({ name: location.name });
      if (!exists) {
        await this.locationRepo.save(this.locationRepo.create(location));
        this.logger.log(`Ubicación creada: ${location.name}`);
      }
    }
  }
}
