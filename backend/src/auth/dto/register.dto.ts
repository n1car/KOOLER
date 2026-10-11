import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  firstName!: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  lastName!: string;

  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password!: string;

  @IsEnum(['ESTUDIANTE', 'ORGANIZADOR'], {
    message: 'El rol debe ser ESTUDIANTE u ORGANIZADOR',
  })
  @IsOptional()
  roleName?: string; // Opcional, por defecto ESTUDIANTE
}
