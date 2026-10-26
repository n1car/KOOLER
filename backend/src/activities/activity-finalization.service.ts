import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CertificatesService } from '../certificates/certificates.service';
import { ActivityEntity } from './entities/activity.entity';

const ACTIVITY_TIME_ZONE = 'America/Bogota';
const ACTIVITY_BATCH_SIZE = 50;

@Injectable()
export class ActivityFinalizationService {
  private readonly logger = new Logger(ActivityFinalizationService.name);
  private isRunning = false;

  constructor(
    @InjectRepository(ActivityEntity)
    private readonly activityRepository: Repository<ActivityEntity>,
    private readonly certificatesService: CertificatesService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async finalizeExpiredActivities(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    try {
      // La zona horaria institucional evita depender de la zona del servidor;
      // SKIP LOCKED permite que varias instancias procesen filas distintas.
      await this.activityRepository.query(
        `WITH candidates AS (
           SELECT id_activity
           FROM activities
           WHERE status = 'ACTIVE'
             AND CASE
               WHEN end_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$'
                 THEN ((date + end_time::time) AT TIME ZONE $1)
                   <= CURRENT_TIMESTAMP
               ELSE FALSE
             END
           ORDER BY id_activity
           LIMIT $2
           FOR UPDATE SKIP LOCKED
         )
         UPDATE activities AS activity
         SET status = 'FINISHED'
         FROM candidates
         WHERE activity.id_activity = candidates.id_activity
           AND activity.status = 'ACTIVE'
         RETURNING activity.id_activity`,
        [ACTIVITY_TIME_ZONE, ACTIVITY_BATCH_SIZE],
      );

      let offset = 0;
      while (true) {
        const finishedActivities = (await this.activityRepository.query(
          `SELECT id_activity AS id
           FROM activities
           WHERE status = 'FINISHED' AND is_certifiable = TRUE
           ORDER BY id_activity
           LIMIT $1 OFFSET $2`,
          [ACTIVITY_BATCH_SIZE, offset],
        )) as Array<{ id: number }>;

        for (const { id } of finishedActivities) {
          try {
            const result =
              await this.certificatesService.issueEligibleCertificates(id);
            if (result.failedStudents > 0) {
              this.logger.warn(
                `Actividad ${id}: ${result.failedStudents} certificados fallaron y se reintentaran en el siguiente ciclo`,
              );
            }
          } catch (error) {
            this.logger.error(
              `No se pudo procesar certificados de la actividad ${id}; se reintentara en el siguiente ciclo`,
              error instanceof Error ? error.stack : undefined,
            );
          }
        }

        if (finishedActivities.length < ACTIVITY_BATCH_SIZE) {
          break;
        }
        offset += ACTIVITY_BATCH_SIZE;
      }
    } catch (error) {
      this.logger.error(
        'Falló el ciclo de finalización automática de actividades',
        error instanceof Error ? error.stack : undefined,
      );
    } finally {
      this.isRunning = false;
    }
  }
}
