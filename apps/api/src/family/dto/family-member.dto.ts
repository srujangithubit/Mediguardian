import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsEnum, IsDateString, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Gender, BloodGroup, Role } from '@prisma/client';

export class AddFamilyMemberDto {
  @ApiProperty({ description: 'The family ID' })
  @IsString()
  @IsNotEmpty()
  familyId: string;

  @ApiPropertyOptional({ description: 'The user ID (if linking an existing user)' })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiProperty({ description: 'Full name of the family member' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiPropertyOptional({ description: 'Date of birth' })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: Date;

  @ApiPropertyOptional({ enum: Gender, description: 'Gender' })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiPropertyOptional({ enum: BloodGroup, description: 'Blood group' })
  @IsEnum(BloodGroup)
  @IsOptional()
  bloodGroup?: BloodGroup;

  @ApiPropertyOptional({ description: 'Allergies list', type: [String] })
  @IsArray()
  @IsOptional()
  allergies?: string[];

  @ApiPropertyOptional({ description: 'Medical notes' })
  @IsString()
  @IsOptional()
  medicalNotes?: string;

  @ApiPropertyOptional({ description: 'Avatar URL' })
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @ApiPropertyOptional({ enum: Role, description: 'Role in the family' })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @ApiPropertyOptional({ description: 'Is the member a dependent' })
  @IsBoolean()
  @IsOptional()
  isDependent?: boolean;
}

export class UpdateFamilyMemberDto extends PartialType(AddFamilyMemberDto) {}
