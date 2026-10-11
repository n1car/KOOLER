import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { FilterActivitiesDto } from './dto/filter-activities.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserEntity } from '../users/entities/user.entity';

@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  // 1. Listar actividades públicas con filtros (público / para todos)
  @Get()
  async findAll(@Query() filter: FilterActivitiesDto) {
    return this.activitiesService.findAll(filter);
  }

  // 2. Mis inscripciones (Estudiante autenticado)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ESTUDIANTE')
  @Get('my-enrollments')
  async getMyEnrollments(@CurrentUser() student: UserEntity) {
    return this.activitiesService.getMyEnrollments(student);
  }

  // 3. Detalle de actividad con cupos calculados
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.activitiesService.findOne(id);
  }

  // 4. Crear actividad (Solo Organizador)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZADOR')
  @Post()
  async create(
    @Body() createDto: CreateActivityDto,
    @CurrentUser() organizer: UserEntity,
  ) {
    return this.activitiesService.create(createDto, organizer);
  }

  // 5. Modificar actividad (Solo Organizador Dueño)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZADOR')
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateActivityDto,
    @CurrentUser() organizer: UserEntity,
  ) {
    return this.activitiesService.update(id, updateDto, organizer);
  }

  // 6. Cancelar actividad (Solo Organizador Dueño)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZADOR')
  @Delete(':id')
  async cancel(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() organizer: UserEntity,
  ) {
    return this.activitiesService.cancel(id, organizer);
  }

  // 7. Inscribirse a una actividad (Solo Estudiante)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ESTUDIANTE')
  @Post(':id/enroll')
  @HttpCode(HttpStatus.OK)
  async enroll(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() student: UserEntity,
  ) {
    return this.activitiesService.enroll(id, student);
  }

  // 8. Ver lista de inscritos (Solo Organizador Dueño)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZADOR')
  @Get(':id/enrollments')
  async getEnrollments(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() organizer: UserEntity,
  ) {
    return this.activitiesService.getEnrollments(id, organizer);
  }
}
