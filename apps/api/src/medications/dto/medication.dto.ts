import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsDateString, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { DosageUnit, MedicationFrequency, MealRelation, MedicationStatus } from '@prisma/client';

export class ScheduleDto {
  @ApiProperty({ description: 'Scheduled time in HH:mm format' })
  @IsString()
  @IsNotEmpty()
  scheduledTime: string;

  @ApiPropertyOptional({ description: 'Day of week (0-6)' })
  @IsNumber()
  @IsOptional()
  dayOfWeek?: number;
}

export class CreateMedicationDto {
  @ApiProperty({ description: 'Family Member ID' })
  @IsString()
  @IsNotEmpty()
  familyMemberId: string;

  @ApiProperty({ description: 'Medication name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Generic name' })
  @IsString()
  @IsOptional()
  genericName?: string;

  @ApiPropertyOptional({ description: 'Brand name' })
  @IsString()
  @IsOptional()
  brandName?: string;

  @ApiProperty({ description: 'Dosage amount' })
  @IsNumber()
  @IsNotEmpty()
  dosage: number;

  @ApiProperty({ enum: DosageUnit })
  @IsEnum(DosageUnit)
  @IsNotEmpty()
  dosageUnit: DosageUnit;

  @ApiProperty({ enum: MedicationFrequency })
  @IsEnum(MedicationFrequency)
  @IsNotEmpty()
  frequency: MedicationFrequency;

  @ApiPropertyOptional({ enum: MealRelation })
  @IsEnum(MealRelation)
  @IsOptional()
  mealRelation?: MealRelation;

  @ApiPropertyOptional({ description: 'Instructions' })
  @IsString()
  @IsOptional()
  instructions?: string;

  @ApiPropertyOptional({ description: 'Side effects' })
  @IsString()
  @IsOptional()
  sideEffects?: string;

  @ApiProperty({ description: 'Start date' })
  @IsDateString()
  @IsNotEmpty()
  startDate: Date;

  @ApiPropertyOptional({ description: 'End date' })
  @IsDateString()
  @IsOptional()
  endDate?: Date;

  @ApiPropertyOptional({ description: 'Total quantity prescribed' })
  @IsNumber()
  @IsOptional()
  totalQuantity?: number;

  @ApiPropertyOptional({ description: 'Remaining quantity' })
  @IsNumber()
  @IsOptional()
  remainingQty?: number;

  @ApiPropertyOptional({ description: 'Refill threshold' })
  @IsNumber()
  @IsOptional()
  refillThreshold?: number;

  @ApiPropertyOptional({ enum: MedicationStatus })
  @IsEnum(MedicationStatus)
  @IsOptional()
  status?: MedicationStatus;

  @ApiPropertyOptional({ description: 'Prescribed by' })
  @IsString()
  @IsOptional()
  prescribedBy?: string;

  @ApiPropertyOptional({ description: 'Prescription ID' })
  @IsString()
  @IsOptional()
  prescriptionId?: string;

  @ApiPropertyOptional({ type: [ScheduleDto] })
  @IsArray()
  @IsOptional()
  schedules?: ScheduleDto[];
}

export class UpdateMedicationDto extends PartialType(CreateMedicationDto) {}
