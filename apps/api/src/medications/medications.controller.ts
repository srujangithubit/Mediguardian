import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/auth.guard';
import { MedicationsService } from './medications.service';
import { CreateMedicationDto, UpdateMedicationDto } from './dto/medication.dto';

@ApiTags('Medications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('medications')
export class MedicationsController {
  constructor(private readonly medicationsService: MedicationsService) {}

  @Post('ocr')
  @ApiOperation({ summary: 'Mock AI OCR to read prescription image/pdf' })
  async processOcr(@Body('fileBase64') fileBase64: string) {
    return this.medicationsService.processOcr(fileBase64);
  }

  @Post(':id/logs')
  @ApiOperation({ summary: 'Log medication adherence' })
  async logAdherence(
    @Param('id') id: string, 
    @Body() data: any,
    @Request() req: any
  ) {
    return this.medicationsService.logAdherence(id, {
      ...data,
      scheduledTime: new Date(data.scheduledTime),
      actualTime: data.actualTime ? new Date(data.actualTime) : undefined,
      userId: req.user?.id // Assuming JwtAuthGuard is applied, but maybe not on this controller? Let's check imports.
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create a new medication' })
  @ApiResponse({ status: 201, description: 'Medication created successfully' })
  async create(@Body() createMedicationDto: CreateMedicationDto) {
    return this.medicationsService.create(createMedicationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all medications for a family member' })
  @ApiQuery({ name: 'familyMemberId', required: true })
  async findAll(@Query('familyMemberId') familyMemberId: string) {
    return this.medicationsService.findAllByFamilyMember(familyMemberId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single medication by ID' })
  async findOne(@Param('id') id: string) {
    return this.medicationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a medication' })
  async update(@Param('id') id: string, @Body() updateMedicationDto: UpdateMedicationDto) {
    return this.medicationsService.update(id, updateMedicationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a medication' })
  async remove(@Param('id') id: string) {
    return this.medicationsService.remove(id);
  }
}
