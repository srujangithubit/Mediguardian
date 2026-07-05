import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto, UpdateAppointmentStatusDto } from './dto/appointments.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new appointment' })
  async create(@Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all appointments for a family member' })
  @ApiQuery({ name: 'familyMemberId', required: true })
  async findAll(@Query('familyMemberId') familyMemberId: string) {
    return this.appointmentsService.findAll(familyMemberId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update appointment status (SCHEDULED, COMPLETED, CANCELLED)' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateAppointmentStatusDto) {
    return this.appointmentsService.updateStatus(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an appointment' })
  async remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
}
