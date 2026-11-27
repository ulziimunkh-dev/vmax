import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventVenue } from './event-venue.entity';
import { EventInquiry } from './event-inquiry.entity';
import { EventOrganization } from './event-organization.entity';
import { EventPhoneReveal } from './event-phone-reveal.entity';
import { EventMessage } from './event-message.entity';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EventVenue,
      EventInquiry,
      EventOrganization,
      EventPhoneReveal,
      EventMessage,
    ]),
  ],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
