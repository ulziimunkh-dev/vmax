import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { Listing } from '../listings/listing.entity';
import { Project } from '../projects/project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Listing, Project])],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
