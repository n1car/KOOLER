import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

export class FilterActivitiesDto {
  @IsEnum(['ACTIVE', 'CANCELLED', 'FINISHED'], {
    message: 'El estado debe ser ACTIVE, CANCELLED o FINISHED',
  })
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @Type(() => Number)
  @IsInt({ message: 'El id de categoría debe ser un número entero' })
  @IsOptional()
  activityTypeId?: number;
}
