import { IsString, IsNotEmpty, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Blood Pressure
export class CreateBloodPressureDto {
  @ApiProperty({ description: 'Family Member ID' })
  @IsString()
  @IsNotEmpty()
  familyMemberId: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  systolic: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  diastolic: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  heartRate?: number;

  @ApiPropertyOptional({ description: 'SEATED, STANDING, SUPINE' })
  @IsString()
  @IsOptional()
  position?: string;

  @ApiPropertyOptional({ description: 'LEFT, RIGHT' })
  @IsString()
  @IsOptional()
  arm?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}

// Blood Sugar
export class CreateSugarLogDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  familyMemberId: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  glucoseLevel: number;

  @ApiProperty({ description: 'FASTING, POST_MEAL, RANDOM, HBA1C' })
  @IsString()
  @IsNotEmpty()
  readingType: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  mealContext?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}

// Weight
export class CreateWeightLogDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  familyMemberId: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  weightKg: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  heightCm?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  bodyFatPercent?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
