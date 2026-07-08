import { IsString, IsNotEmpty, IsOptional, IsArray, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDigitalTwinDto {
  @ApiProperty({ description: 'Family Member ID' })
  @IsString()
  @IsNotEmpty()
  familyMemberId: string;

  @ApiPropertyOptional({ description: 'Latitude for Weather Context' })
  @IsNumber()
  @IsOptional()
  lat?: number;

  @ApiPropertyOptional({ description: 'Longitude for Weather Context' })
  @IsNumber()
  @IsOptional()
  lon?: number;
}

export class IdentifyMedicineDto {
  @ApiProperty({ description: 'Base64 encoded image string' })
  @IsString()
  @IsNotEmpty()
  base64Image: string;

  @ApiProperty({ description: 'MIME type of the image (e.g. image/jpeg)' })
  @IsString()
  @IsNotEmpty()
  mimeType: string;
}

export class CheckInteractionDto {
  @ApiProperty({ description: 'Family Member ID' })
  @IsString()
  @IsNotEmpty()
  familyMemberId: string;

  @ApiProperty({ description: 'Proposed medication name to check interactions against' })
  @IsString()
  @IsNotEmpty()
  proposedMedicationName: string;
}

export class ChatMessageDto {
  @ApiProperty({ description: 'Role (user or model)' })
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty({ description: 'Parts containing the text message' })
  @IsArray()
  @IsNotEmpty()
  parts: { text: string }[];
}

export class CopilotChatDto {
  @ApiProperty({ description: 'Family Member ID' })
  @IsString()
  @IsNotEmpty()
  familyMemberId: string;

  @ApiProperty({ description: 'The message from the user' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({ type: [ChatMessageDto], description: 'Previous conversation history' })
  @IsArray()
  @IsOptional()
  history?: ChatMessageDto[];
}

export class ProcessJournalDto {
  @ApiProperty({ description: 'Family Member ID' })
  @IsString()
  @IsNotEmpty()
  familyMemberId: string;

  @ApiProperty({ description: 'Unstructured journal text or transcribed voice log' })
  @IsString()
  @IsNotEmpty()
  text: string;
}

export class MedicineChatDto {
  @ApiProperty({ description: 'The message from the user' })
  @IsString()
  @IsNotEmpty()
  query: string;

  @ApiPropertyOptional({ description: 'Previous conversation history' })
  @IsArray()
  @IsOptional()
  history?: any[];
}
