import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateActivityDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  startTime?: string;

  @IsString()
  @IsOptional()
  endTime?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  capacity?: number;

  @IsEnum(['ACTIVE', 'CANCELLED', 'FINISHED'], {
    message: 'El estado debe ser ACTIVE, CANCELLED o FINISHED',
  })
  @IsOptional()
  status?: 'ACTIVE' | 'CANCELLED' | 'FINISHED';

  @IsDateString()
  @IsOptional()
  registrationDeadline?: string;

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

  @IsInt()
  @IsOptional()
  activityTypeId?: number;

  @IsInt()
  @IsOptional()
  locationId?: number;
}
