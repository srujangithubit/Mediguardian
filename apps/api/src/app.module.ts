import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FamilyModule } from './family/family.module';
import { CommonModule } from './common/common.module';
import { MedicationsModule } from './medications/medications.module';
import { TimelineModule } from './timeline/timeline.module';
import { SearchModule } from './search/search.module';
import { AiModule } from './ai/ai.module';
import { VitalsModule } from './vitals/vitals.module';
import { CalendarModule } from './calendar/calendar.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { GamificationModule } from './gamification/gamification.module';
import { ShareModule } from './share/share.module';
import { EmergencyModule } from './emergency/emergency.module';
import { FamiliesModule } from './families/families.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { RecordsModule } from './records/records.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    FamilyModule,
    CommonModule,
    MedicationsModule,
    TimelineModule,
    SearchModule,
    AiModule,
    VitalsModule,
    CalendarModule,
    AnalyticsModule,
    GamificationModule,
    ShareModule,
    EmergencyModule,
    FamiliesModule,
    AppointmentsModule,
    RecordsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
