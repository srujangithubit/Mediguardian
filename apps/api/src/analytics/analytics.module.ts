import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { TimelineReplayService } from './timeline-replay.service';
import { TimelineModule } from '../timeline/timeline.module';

@Module({
  imports: [TimelineModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, TimelineReplayService],
  exports: [AnalyticsService, TimelineReplayService],
})
export class AnalyticsModule {}
