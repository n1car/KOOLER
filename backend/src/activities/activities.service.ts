import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EnrollmentEntity } from './entities/enrollment.entity';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(EnrollmentEntity)
    private readonly enrollmentsRepository: Repository<EnrollmentEntity>,
  ) {}

  async isStudentEnrolled(
    activityId: number,
    studentId: number,
  ): Promise<boolean> {
    const enrollment = await this.enrollmentsRepository.findOneBy({
      activity: { id: activityId },
      user: { id: studentId },
    });

    return enrollment !== null;
  }
}
