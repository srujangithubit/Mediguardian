import { IsString, IsOptional, IsEnum, IsArray, IsDateString } from 'class-validator';
import { Gender, BloodGroup } from '@prisma/client';

export class CreateMemberDto {
  @IsString()
  fullName: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsEnum(BloodGroup)
  bloodGroup?: BloodGroup;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @IsOptional()
  @IsString()
  medicalNotes?: string;
}
