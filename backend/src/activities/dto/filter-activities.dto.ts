import { IsEnum, IsOptional, IsString } from 'class-validator';

export class FilterActivitiesDto {
  @IsEnum(['ACTIVE', 'CANCELLED', 'FINISHED'], {
    message: 'El estado debe ser ACTIVE, CANCELLED o FINISHED',
  })
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  search?: string;
}
