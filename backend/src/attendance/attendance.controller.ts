import { Body, Controller, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { RecordAttendanceDto } from './dto/record-attendance.dto';
import { AttendanceService } from './attendance.service';

interface AuthenticatedUser {
  id: number;
}

@Controller('activities')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':activityId/sessions/:sessionId/attendance')
  @Roles('ORGANIZADOR')
  async recordAttendance(
    @Param('activityId', ParseIntPipe) activityId: number,
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Body() dto: RecordAttendanceDto,
    @CurrentUser() organizer: AuthenticatedUser,
  ) {
    const attendance = await this.attendanceService.recordAttendance(
      organizer.id,
      dto.studentId,
      activityId,
      sessionId,
      dto.status,
    );

    return {
      id: attendance.id,
      studentId: attendance.user.id,
      activityId: attendance.session.activity.id,
      sessionId: attendance.session.id,
      status: attendance.status,
      registrationDate: attendance.registrationDate,
    };
  }
}
