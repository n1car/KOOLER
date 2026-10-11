import { IsOptional, IsString } from 'class-validator';

export class FilterActivitiesDto {
  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  search?: string;
}
