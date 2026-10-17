import { IsIn, IsInt, Min } from 'class-validator';

export class RecordAttendanceDto {
  @IsInt()
  @Min(1)
  studentId!: number;

  @IsIn(['PRESENT', 'ABSENT'])
  status!: 'PRESENT' | 'ABSENT';
}
