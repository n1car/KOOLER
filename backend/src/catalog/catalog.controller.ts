import { Controller, Get } from '@nestjs/common';
import { CatalogService } from './catalog.service';

@Controller()
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  // Catálogo público de categorías de actividad (para filtros y creación).
  @Get('activity-types')
  async getActivityTypes() {
    return this.catalogService.findAllActivityTypes();
  }

  // Catálogo público de ubicaciones (para creación de actividades).
  @Get('locations')
  async getLocations() {
    return this.catalogService.findAllLocations();
  }
}
