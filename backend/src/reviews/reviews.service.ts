import {
  BadRequestException, ConflictException, ForbiddenException,
  Injectable, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewEntity } from './entities/review.entity';
import { ActivityEntity } from '../activities/entities/activity.entity';
import { AttendanceEntity } from '../attendance/entities/attendance.entity';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(ReviewEntity) private readonly reviewRepo: Repository<ReviewEntity>,
    @InjectRepository(ActivityEntity) private readonly activityRepo: Repository<ActivityEntity>,
    @InjectRepository(AttendanceEntity) private readonly attendanceRepo: Repository<AttendanceEntity>,
  ) {}

  // RF09: misma regla que ActivitiesService. Una actividad ACTIVE cuyo horario
  // ya pasó cuenta como finalizada aunque el estado persistido no cambie.

  private isFinished(activity: ActivityEntity, now: Date = new Date()): boolean {
    if (activity.status === 'FINISHED') return true;
    if (activity.status !== 'ACTIVE' || !activity.date || !activity.endTime) return false;
    const end = new Date(`${activity.date}T${activity.endTime}`);
    return !Number.isNaN(end.getTime()) && now >= end;
  }

  async create(student: { id: number }, dto: CreateReviewDto): Promise<ReviewEntity> {
    const activity = await this.activityRepo.findOne({ where: { id: dto.activityId } });
    if (!activity) throw new NotFoundException(`Actividad con ID ${dto.activityId} no encontrada`);

    if (!this.isFinished(activity)) {
      throw new BadRequestException('Solo se pueden calificar actividades finalizadas');
    }

    // La asistencia debe ser por sesión: basta con PRESENT en alguna sesión de la actividad.
    const attended = await this.attendanceRepo.findOne({
      where: {
        user: { id: student.id },
        session: { activity: { id: dto.activityId } },
        status: 'PRESENT',
      },
    });
    if (!attended) {
      throw new ForbiddenException('Solo puedes calificar actividades a las que asististe');
    }

    try {
      return await this.reviewRepo.save(
        this.reviewRepo.create({
          idUser: student.id,
          idActivity: dto.activityId,
          rating: dto.rating,
          comment: dto.comment ?? null,
        }),
      );
    } catch (err: any) {
      // 23505 = violación de UNIQUE(id_user, id_activity)
      if (err?.code === '23505') throw new ConflictException('Ya calificaste esta actividad');
      throw err;
    }
  }
    async findByActivity(activityId: number) {
    const raw = await this.reviewRepo
      .createQueryBuilder('r')
      .select('AVG(r.rating)', 'avg')
      .addSelect('COUNT(r.id)', 'total')
      .where('r.idActivity = :activityId', { activityId })
      .getRawOne<{ avg: string | null; total: string }>();

    const rows = await this.reviewRepo.find({
      where: { idActivity: activityId },
      relations: { user: true },
      order: { date: 'DESC' },
    });

    return {
      average: raw?.avg ? Math.round(Number(raw.avg) * 10) / 10 : 0,
      total: Number(raw?.total ?? 0),
      items: rows.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        date: r.date,
        author: r.user.firstName, // solo el nombre; nunca devuelvas UserEntity completa
      })),
    };
  }
    async findForOrganizer(organizerId: number, activityId: number) {
    const activity = await this.activityRepo.findOne({
      where: { id: activityId },
      relations: { organizer: true },
    });
    if (!activity) throw new NotFoundException(`Actividad con ID ${activityId} no encontrada`);

    if (activity.organizer.id !== organizerId) {
      throw new ForbiddenException('Solo el organizador responsable puede ver esta retroalimentación');
    }
    return this.findByActivity(activityId);
  }
}