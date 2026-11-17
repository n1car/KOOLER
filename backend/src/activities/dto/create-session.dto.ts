import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreateSessionDto {
  @IsDateString(
    {},
    { message: 'La fecha de la sesión debe tener un formato válido (YYYY-MM-DD)' },
  )
  @IsNotEmpty({ message: 'La fecha de la sesión es obligatoria' })
  sessionDate!: string;

  @IsString({ message: 'La hora de inicio debe ser texto' })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'La hora de inicio debe tener formato HH:mm',
  })
  @IsOptional()
  startTime?: string;

  @IsString({ message: 'La hora de fin debe ser texto' })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'La hora de fin debe tener formato HH:mm',
  })
  @IsOptional()
  endTime?: string;
}
