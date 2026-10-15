import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserEntity } from '../users/entities/user.entity';
import { HistoryService } from './history.service';

@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  // Historial de actividades finalizadas del estudiante (Solo Estudiante)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ESTUDIANTE')
  @Get()
  async findMine(@CurrentUser() student: UserEntity) {
    return this.historyService.findForStudent(student.id);
  }
}