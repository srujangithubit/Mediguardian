import { IsString, IsNotEmpty, IsDateString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  familyMemberId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  doctorName: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  appointmentDate: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  hospitalName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  specialization?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isOnline?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  meetingLink?: string;
}

export class UpdateAppointmentStatusDto {
  @ApiProperty({ description: 'SCHEDULED, COMPLETED, CANCELLED' })
  @IsString()
  @IsNotEmpty()
  status: string;
}
