import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { RoleEntity } from '../roles/entities/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly rolesRepository: Repository<RoleEntity>,
  ) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: { role: true },
    });
  }

  async findById(id: number): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: { role: true },
    });
    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    return user;
  }

  async create(data: {
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
    roleName?: string;
  }): Promise<UserEntity> {
    const roleNameToFind = data.roleName || 'ESTUDIANTE';
    const role = await this.rolesRepository.findOneBy({ name: roleNameToFind });

    if (!role) {
      throw new NotFoundException(`Rol ${roleNameToFind} no encontrado`);
    }

    const user = this.usersRepository.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      passwordHash: data.passwordHash,
      role,
      status: 'ACTIVE',
    });

    return this.usersRepository.save(user);
  }
}
