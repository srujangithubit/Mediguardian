import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFamilyDto {
  @ApiProperty({ description: 'The name of the family group' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'The user ID of the family owner' })
  @IsString()
  @IsNotEmpty()
  ownerId: string;

  @ApiPropertyOptional({ description: 'Description of the family group' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Avatar URL for the family' })
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @ApiPropertyOptional({ description: 'Whether the family is active', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
