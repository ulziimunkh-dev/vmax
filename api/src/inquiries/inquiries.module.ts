import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inquiry } from './inquiry.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Inquiry])],
  exports: [TypeOrmModule],
})
export class InquiriesModule {}
