import { Controller, Post, Body, Get, Param, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ShareService } from './share.service';
import { PrismaService } from '../prisma/prisma.service';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateShareDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  familyMemberId: string;

  @ApiProperty({ description: 'Number of days the link is valid' })
  @IsNumber()
  @IsNotEmpty()
  daysValid: number;
}

@ApiTags('Share (Caregiver & Doctor)')
@Controller('share')
export class ShareController {
  constructor(
    private readonly shareService: ShareService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate a secure, time-limited read-only access token' })
  async generateLink(@Body() dto: GenerateShareDto) {
    return this.shareService.generateShareLink(dto.familyMemberId, dto.daysValid);
  }

  @Get(':token')
  @ApiOperation({ summary: 'Access shared health profile via token' })
  @ApiResponse({ status: 200, description: 'Returns read-only patient profile' })
  async accessSharedProfile(@Param('token') token: string) {
    const familyMemberId = await this.shareService.validateShareToken(token);
    
    const profile = await this.prisma.familyMember.findUnique({
      where: { id: familyMemberId },
      include: {
        medications: { where: { status: 'ACTIVE' } },
        bloodPressureLogs: { take: 10, orderBy: { measuredAt: 'desc' } },
        sugarLogs: { take: 10, orderBy: { measuredAt: 'desc' } },
        digitalTwin: true,
      },
    });

    if (!profile) {
      throw new UnauthorizedException('Profile not found');
    }

    return profile;
  }
}
