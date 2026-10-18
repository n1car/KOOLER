import { Body, Controller, Post, UseGuards, Get, Param, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserEntity } from '../users/entities/user.entity';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // Promedio y comentarios públicos de una actividad (lectura pública)
  @Get('activity/:activityId')
  async findByActivity(@Param('activityId', ParseIntPipe) activityId: number) {
    return this.reviewsService.findByActivity(activityId);
  }

  // Calificar una actividad finalizada a la que asistió (Solo Estudiante)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ESTUDIANTE')
  @Post()
  async create(@Body() dto: CreateReviewDto, @CurrentUser() student: UserEntity) {
    return this.reviewsService.create(student, dto);
  }

  // Retroalimentación de su actividad (Solo Organizador dueño, solo lectura)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZADOR')
  @Get('organizer/activity/:activityId')
  async findForOrganizer(
    @Param('activityId', ParseIntPipe) activityId: number,
    @CurrentUser() organizer: UserEntity,
  ) {
    return this.reviewsService.findForOrganizer(organizer.id, activityId);
  }
}