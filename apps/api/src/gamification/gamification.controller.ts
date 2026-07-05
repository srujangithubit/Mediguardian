import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { GamificationService } from './gamification.service';

@ApiTags('Gamification')
@Controller('gamification')
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('badges')
  @ApiOperation({ summary: 'Get earned badges based on streaks' })
  @ApiQuery({ name: 'familyMemberId', required: true })
  async getBadges(@Query('familyMemberId') familyMemberId: string) {
    return this.gamificationService.evaluateBadges(familyMemberId);
  }
}
