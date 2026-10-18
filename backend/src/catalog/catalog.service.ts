import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityTypeEntity } from './entities/activity-type.entity';
import { LocationEntity } from './entities/location.entity';

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(ActivityTypeEntity)
    private readonly activityTypeRepo: Repository<ActivityTypeEntity>,
    @InjectRepository(LocationEntity)
    private readonly locationRepo: Repository<LocationEntity>,
  ) {}

  findAllActivityTypes(): Promise<ActivityTypeEntity[]> {
    return this.activityTypeRepo.find({ order: { name: 'ASC' } });
  }

  findAllLocations(): Promise<LocationEntity[]> {
    return this.locationRepo.find({ order: { name: 'ASC' } });
  }

  async findActivityTypeById(id: number): Promise<ActivityTypeEntity> {
    const activityType = await this.activityTypeRepo.findOne({ where: { id } });
    if (!activityType) {
      throw new NotFoundException(`Categoría con id ${id} no encontrada`);
    }
    return activityType;
  }

  async findLocationById(id: number): Promise<LocationEntity> {
    const location = await this.locationRepo.findOne({ where: { id } });
    if (!location) {
      throw new NotFoundException(`Ubicación con id ${id} no encontrada`);
    }
    return location;
  }
}
