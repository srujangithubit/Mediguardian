import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { VitalsService } from './vitals.service';
import { CreateBloodPressureDto, CreateSugarLogDto, CreateWeightLogDto } from './dto/vitals.dto';

@ApiTags('Vitals')
@Controller('vitals')
export class VitalsController {
  constructor(private readonly vitalsService: VitalsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get summary analytics for vitals' })
  @ApiQuery({ name: 'familyMemberId', required: true })
  async getSummary(@Query('familyMemberId') familyMemberId: string) {
    return this.vitalsService.getSummary(familyMemberId);
  }

  @Post('bp')
  @ApiOperation({ summary: 'Log Blood Pressure' })
  async logBp(@Body() dto: CreateBloodPressureDto) {
    return this.vitalsService.createBp(dto);
  }

  @Get('bp')
  @ApiOperation({ summary: 'Get Blood Pressure Logs' })
  @ApiQuery({ name: 'familyMemberId', required: true })
  async getBp(@Query('familyMemberId') familyMemberId: string) {
    return this.vitalsService.getBpLogs(familyMemberId);
  }

  @Post('sugar')
  @ApiOperation({ summary: 'Log Blood Sugar' })
  async logSugar(@Body() dto: CreateSugarLogDto) {
    return this.vitalsService.createSugar(dto);
  }

  @Get('sugar')
  @ApiOperation({ summary: 'Get Blood Sugar Logs' })
  @ApiQuery({ name: 'familyMemberId', required: true })
  async getSugar(@Query('familyMemberId') familyMemberId: string) {
    return this.vitalsService.getSugarLogs(familyMemberId);
  }

  @Post('weight')
  @ApiOperation({ summary: 'Log Weight' })
  async logWeight(@Body() dto: CreateWeightLogDto) {
    return this.vitalsService.createWeight(dto);
  }

  @Get('weight')
  @ApiOperation({ summary: 'Get Weight Logs' })
  @ApiQuery({ name: 'familyMemberId', required: true })
  async getWeight(@Query('familyMemberId') familyMemberId: string) {
    return this.vitalsService.getWeightLogs(familyMemberId);
  }
}
