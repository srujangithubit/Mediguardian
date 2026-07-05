import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EmergencyService } from './emergency.service';

@ApiTags('Emergency')
@Controller('emergency')
export class EmergencyController {
  constructor(private readonly emergencyService: EmergencyService) {}

  @Get(':familyMemberId')
  @ApiOperation({ summary: 'Get smart emergency QR card data for rapid retrieval' })
  @ApiResponse({ status: 200, description: 'Critical life-saving profile returned' })
  async getEmergencyCard(@Param('familyMemberId') familyMemberId: string) {
    return this.emergencyService.getEmergencyProfile(familyMemberId);
  }
}
