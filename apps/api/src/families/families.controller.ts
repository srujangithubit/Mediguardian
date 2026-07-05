import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FamiliesService } from './families.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

@ApiTags('Families & Patients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('families')
export class FamiliesController {
  constructor(private readonly familiesService: FamiliesService) {}

  @Get('members')
  @ApiOperation({ summary: 'Get all family members and dependents' })
  async getMyFamilyMembers(@Request() req: any) {
    return this.familiesService.getMyFamilyMembers(req.user.id);
  }

  @Post(':familyId/members')
  @ApiOperation({ summary: 'Add a new dependent to a family' })
  async createDependent(
    @Request() req: any,
    @Param('familyId') familyId: string,
    @Body() dto: CreateMemberDto,
  ) {
    return this.familiesService.createDependent(req.user.id, familyId, dto);
  }

  @Put('members/:id')
  @ApiOperation({ summary: 'Update family member details' })
  async updateMember(
    @Request() req: any,
    @Param('id') memberId: string,
    @Body() dto: UpdateMemberDto,
  ) {
    return this.familiesService.updateMember(req.user.id, memberId, dto);
  }

  @Delete('members/:id')
  @ApiOperation({ summary: 'Remove a family member' })
  async removeMember(
    @Request() req: any,
    @Param('id') memberId: string,
  ) {
    return this.familiesService.removeMember(req.user.id, memberId);
  }
}
