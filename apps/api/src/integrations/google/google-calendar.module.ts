import { Module, Global } from '@nestjs/common';
import { GoogleCalendarService } from './google-calendar.service';
import { GoogleAuthController } from './google-auth.controller';

@Global()
@Module({
  controllers: [GoogleAuthController],
  providers: [GoogleCalendarService],
  exports: [GoogleCalendarService],
})
export class GoogleCalendarModule {}
