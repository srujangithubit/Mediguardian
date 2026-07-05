import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TimelineService } from './timeline.service';

@ApiTags('Timeline')
@Controller('timeline')
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Get()
  @ApiOperation({ summary: 'Get aggregated timeline for a family member' })
  @ApiQuery({ name: 'familyMemberId', required: true })
  @ApiQuery({ name: 'date', required: true, description: 'ISO Date string (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Aggregated timeline returned' })
  async getTimeline(
    @Query('familyMemberId') familyMemberId: string,
    @Query('date') date: string,
  ) {
    return this.timelineService.getTimeline(familyMemberId, date);
  }
}
