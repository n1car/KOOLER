import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateActivityDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la actividad es obligatorio' })
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  description!: string;

  @IsDateString({}, { message: 'La fecha debe tener un formato válido (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'La fecha es obligatoria' })
  date!: string;

  @IsString()
  @IsNotEmpty({ message: 'La hora de inicio es obligatoria' })
  startTime!: string;

  @IsString()
  @IsNotEmpty({ message: 'La hora de fin es obligatoria' })
  endTime!: string;

  @IsInt({ message: 'La capacidad debe ser un número entero' })
  @Min(1, { message: 'La capacidad mínima es de 1 participante' })
  capacity!: number;

  @IsDateString({}, { message: 'La fecha límite de inscripción debe ser válida' })
  @IsNotEmpty({ message: 'La fecha límite de inscripción es obligatoria' })
  registrationDeadline!: string;

  @IsBoolean()
  @IsOptional()
  isCertifiable?: boolean;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  minAttendancePercentage?: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
