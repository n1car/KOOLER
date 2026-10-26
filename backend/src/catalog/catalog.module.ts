import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { ActivityTypeEntity } from './entities/activity-type.entity';
import { LocationEntity } from './entities/location.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityTypeEntity, LocationEntity])],
  controllers: [CatalogController],
  providers: [CatalogService],
  exports: [CatalogService, TypeOrmModule],
})
export class CatalogModule {}
