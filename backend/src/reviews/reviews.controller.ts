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

  // Calificar una actividad finalizada a la que asistió (Solo Estudiante)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ESTUDIANTE', 'ORGANIZADOR')
   @Get('activity/:activityId')
  async findByActivity(@Param('activityId', ParseIntPipe) activityId: number) {
    return this.reviewsService.findByActivity(activityId);
  }
  @Post()
  async create(@Body() dto: CreateReviewDto, @CurrentUser() student: UserEntity) {
    return this.reviewsService.create(student, dto);
  }
}