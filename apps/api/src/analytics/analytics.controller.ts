import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { TimelineReplayService } from './timeline-replay.service';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly replayService: TimelineReplayService,
  ) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get 30-day aggregated stats' })
  @ApiQuery({ name: 'familyMemberId', required: true })
  async getStats(@Query('familyMemberId') familyMemberId: string) {
    return this.analyticsService.getAggregatedStats(familyMemberId);
  }

  @Get('replay')
  @ApiOperation({ summary: 'Get chronological data for timeline replay UI' })
  @ApiQuery({ name: 'familyMemberId', required: true })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  async getReplay(
    @Query('familyMemberId') familyMemberId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.replayService.getReplayData(familyMemberId, startDate, endDate);
  }
}
