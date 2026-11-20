import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { RoleEntity } from '../role.entity';

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

  async create(data: { //  esta función crea un nuevo usuario en la base de datos, asignándole un rol específico. Si no se proporciona un rol, se asigna el rol por defecto "ESTUDIANTE". y sirve para registrar nuevos usuarios en el sistema, asegurando que cada usuario tenga un rol válido y que la información del usuario se almacene correctamente en la base de datos.
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

    const user = this.usersRepository.create({ // esta funcion crea una nueva instancia de la entidad UserEntity con los datos proporcionados, incluyendo el nombre, apellido, correo electrónico, hash de la contraseña y el rol asociado. Luego, guarda esta instancia en la base de datos utilizando el repositorio de usuarios.
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
