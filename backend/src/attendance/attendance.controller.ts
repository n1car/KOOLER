import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RecordAttendanceDto } from './dto/record-attendance.dto';
import { AttendanceService } from './attendance.service';

interface AuthenticatedUser {
  id: number;
}

@Controller('activities')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post(':activityId/attendance')
  @Roles('ORGANIZADOR')
  async recordAttendance(
    @Param('activityId', ParseIntPipe) activityId: number,
    @Body() dto: RecordAttendanceDto,
    @CurrentUser() organizer: AuthenticatedUser,
  ) {
    const attendance = await this.attendanceService.recordAttendance(
      organizer.id,
      dto.studentId,
      activityId,
      dto.status,
    );

    return {
      id: attendance.id,
      studentId: attendance.user.id,
      activityId: attendance.activity.id,
      status: attendance.status,
      registrationDate: attendance.registrationDate,
    };
  }
}
