import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CabinetService } from './cabinet.service';

@ApiTags('Medicine Cabinet')
@Controller('cabinet')
export class CabinetController {
  constructor(private readonly cabinetService: CabinetService) {}

  @Get()
  @ApiOperation({ summary: 'Get medicine cabinet status for a family (Inventory & Restock Engine)' })
  @ApiQuery({ name: 'familyId', required: true })
  @ApiResponse({ status: 200, description: 'Cabinet status returned successfully' })
  async getCabinetStatus(@Query('familyId') familyId: string) {
    return this.cabinetService.getCabinetStatus(familyId);
  }
}
