import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FamilyService } from './family.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';
import { AddFamilyMemberDto, UpdateFamilyMemberDto } from './dto/family-member.dto';

@ApiTags('Family')
@Controller('family')
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new family group' })
  @ApiResponse({ status: 201, description: 'Family successfully created' })
  async create(@Body() createFamilyDto: CreateFamilyDto) {
    const ownerId = createFamilyDto.ownerId;
    return this.familyService.create(createFamilyDto, ownerId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all families for a user' })
  @ApiResponse({ status: 200, description: 'Return all families with members for a user' })
  async findByUser(@Param('userId') userId: string) {
    return this.familyService.findByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a family group by ID' })
  @ApiResponse({ status: 200, description: 'Return family group with members' })
  async findOne(@Param('id') id: string) {
    return this.familyService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a family group' })
  @ApiResponse({ status: 200, description: 'Family group successfully updated' })
  async update(@Param('id') id: string, @Body() updateFamilyDto: UpdateFamilyDto) {
    return this.familyService.update(id, updateFamilyDto);
  }

  // --- Family Member Endpoints ---

  @Post(':id/members')
  @ApiOperation({ summary: 'Add a new member to a family group' })
  @ApiResponse({ status: 201, description: 'Family member successfully added' })
  async addMember(@Param('id') familyId: string, @Body() addMemberDto: AddFamilyMemberDto) {
    return this.familyService.addMember(familyId, addMemberDto);
  }

  @Patch('members/:memberId')
  @ApiOperation({ summary: 'Update a family member' })
  @ApiResponse({ status: 200, description: 'Family member successfully updated' })
  async updateMember(@Param('memberId') memberId: string, @Body() updateMemberDto: UpdateFamilyMemberDto) {
    return this.familyService.updateMember(memberId, updateMemberDto);
  }

  @Delete('members/:memberId')
  @ApiOperation({ summary: 'Remove a family member' })
  @ApiResponse({ status: 200, description: 'Family member successfully removed' })
  async removeMember(@Param('memberId') memberId: string) {
    return this.familyService.removeMember(memberId);
  }
}
