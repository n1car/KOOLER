import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EnrollmentEntity } from '../activities/entities/enrollment.entity';
import { ActivityEntity } from '../activities/entities/activity.entity';
import { AttendanceEntity } from '../attendance/entities/attendance.entity';
import { ReviewEntity } from '../reviews/entities/review.entity';

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(EnrollmentEntity) private readonly enrollmentRepo: Repository<EnrollmentEntity>,
    @InjectRepository(AttendanceEntity) private readonly attendanceRepo: Repository<AttendanceEntity>,
    @InjectRepository(ReviewEntity) private readonly reviewRepo: Repository<ReviewEntity>,
  ) {}

  private isFinished(activity: ActivityEntity, now: Date = new Date()): boolean {
    if (activity.status === 'FINISHED') return true;
    if (activity.status !== 'ACTIVE' || !activity.date || !activity.endTime) return false;
    const end = new Date(`${activity.date}T${activity.endTime}`);
    return !Number.isNaN(end.getTime()) && now >= end;
  }

  async findForStudent(studentId: number) {
    // Tres consultas planas cruzadas en memoria: evita N+1.
    const [enrollments, presentAttendances, reviews] = await Promise.all([
      this.enrollmentRepo.find({
        where: { user: { id: studentId } },
        relations: { activity: true },
      }),
      this.attendanceRepo.find({
        where: { user: { id: studentId }, status: 'PRESENT' },
        relations: { session: { activity: true } },
      }),
      this.reviewRepo.find({ where: { idUser: studentId } }),
    ]);

    const asistio = new Set(presentAttendances.map((a) => a.session.activity.id));
    const misCalificaciones = new Map(reviews.map((r) => [r.idActivity, r.rating]));

    return enrollments
      .filter((e) => this.isFinished(e.activity))
      .map((e) => ({
        activityId: e.activity.id,
        name: e.activity.name,
        date: e.activity.date,
        attendance: asistio.has(e.activity.id) ? 'PRESENT' : 'ABSENT',
        reviewed: misCalificaciones.has(e.activity.id),
        myRating: misCalificaciones.get(e.activity.id) ?? null,
      }))
      .sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }
}