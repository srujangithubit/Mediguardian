import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CalendarService } from './calendar.service';

@ApiTags('Calendar')
@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get()
  @ApiOperation({ summary: 'Get unified AI health calendar for a family' })
  @ApiQuery({ name: 'familyId', required: true })
  @ApiQuery({ name: 'startDate', required: true, description: 'ISO string' })
  @ApiQuery({ name: 'endDate', required: true, description: 'ISO string' })
  async getCalendar(
    @Query('familyId') familyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.calendarService.getFamilyCalendar(familyId, startDate, endDate);
  }
}
