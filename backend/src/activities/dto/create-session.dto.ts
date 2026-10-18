import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSessionDto {
  @IsDateString(
    {},
    { message: 'La fecha de la sesión debe tener un formato válido (YYYY-MM-DD)' },
  )
  @IsNotEmpty({ message: 'La fecha de la sesión es obligatoria' })
  sessionDate!: string;

  @IsString({ message: 'La hora de inicio debe ser texto' })
  @IsOptional()
  startTime?: string;

  @IsString({ message: 'La hora de fin debe ser texto' })
  @IsOptional()
  endTime?: string;
}
