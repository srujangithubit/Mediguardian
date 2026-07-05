import { Controller, Get, Post, Delete, Param, Query, UseGuards, UseInterceptors, UploadedFile, Body, BadRequestException, StreamableFile, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { RecordsService } from './records.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Medical Records')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('records')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a medical record document' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        familyMemberId: { type: 'string' },
        title: { type: 'string' },
        type: { type: 'string', description: 'LAB_REPORT, PRESCRIPTION, SCAN, OTHER' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('familyMemberId') familyMemberId: string,
    @Body('title') title: string,
    @Body('type') type: string,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    if (!familyMemberId || !title || !type) {
      throw new BadRequestException('familyMemberId, title, and type are required');
    }

    return this.recordsService.uploadRecord(familyMemberId, title, type, file);
  }

  @Get()
  @ApiOperation({ summary: 'Get all medical records for a family member' })
  async findAll(@Query('familyMemberId') familyMemberId: string) {
    if (!familyMemberId) {
      throw new BadRequestException('familyMemberId is required');
    }
    return this.recordsService.findAll(familyMemberId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a medical record' })
  async remove(@Param('id') id: string) {
    return this.recordsService.remove(id);
  }

  @Get('download/:familyMemberId/:fileName')
  @ApiOperation({ summary: 'Download a locally stored medical record' })
  async downloadLocal(
    @Param('familyMemberId') familyMemberId: string,
    @Param('fileName') fileName: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const fs = require('fs');
    const path = require('path');
    
    // Ensure the filename is correctly decoded (handles spaces and special characters)
    const decodedFileName = decodeURIComponent(fileName);
    const filePath = path.join(process.cwd(), '.local-storage', familyMemberId, decodedFileName);
    
    if (!fs.existsSync(filePath)) {
      throw new BadRequestException('File not found on disk');
    }
    
    // Set appropriate headers so the browser treats it as a file download or inline view
    res.set({
      'Content-Disposition': `inline; filename="${decodedFileName}"`,
    });
    
    const file = fs.createReadStream(filePath);
    return new StreamableFile(file);
  }
}
