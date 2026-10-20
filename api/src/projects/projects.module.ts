import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './project.entity';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Project])],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule implements OnModuleInit {
  constructor(private readonly projectsService: ProjectsService) {}

  async onModuleInit() {
    // Seed initial high-quality projects if table is empty
    try {
      await this.projectsService.seedDemoProjectsIfEmpty();
    } catch (e) {
      console.warn('Projects seed error:', e);
    }
  }
}
