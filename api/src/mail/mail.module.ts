import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get('mail.host'),
          port: configService.get('mail.port'),
          secure: false, // true for 465, false for other ports
          auth: {
            user: configService.get('mail.user'),
            pass: configService.get('mail.pass'),
          },
        },
        defaults: {
          from: `"Vmax" <${configService.get('mail.user')}>`,
        },
      }),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
