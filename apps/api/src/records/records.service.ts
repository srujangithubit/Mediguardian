import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class RecordsService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(RecordsService.name);
  private isSupabaseConfigured = false;

  constructor(private prisma: PrismaService) {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';

    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
      this.isSupabaseConfigured = true;
    } else {
      this.logger.warn('Supabase URL or Key is missing. File uploads will be mocked for local development.');
    }
  }

  async uploadRecord(
    familyMemberId: string,
    title: string,
    type: string,
    file: Express.Multer.File,
  ) {
    let fileUrl = '';
    const fileName = `${familyMemberId}/${Date.now()}_${file.originalname}`;

    if (this.isSupabaseConfigured) {
      try {
        const { data, error } = await this.supabase.storage
          .from('medical_records')
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
          });

        if (error) {
          throw new Error(error.message);
        }

        const { data: publicUrlData } = this.supabase.storage
          .from('medical_records')
          .getPublicUrl(fileName);
          
        fileUrl = publicUrlData.publicUrl;
      } catch (err: any) {
        this.logger.error(`Supabase upload failed: ${err.message}`);
        throw new InternalServerErrorException('Failed to upload file to storage');
      }
    } else {
      // Save locally for development if Supabase isn't configured
      const storageDir = path.join(process.cwd(), '.local-storage', familyMemberId);
      if (!fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir, { recursive: true });
      }
      
      const localFileName = `${Date.now()}_${file.originalname}`;
      const filePath = path.join(storageDir, localFileName);
      fs.writeFileSync(filePath, file.buffer);
      
      fileUrl = `http://localhost:4000/records/download/${familyMemberId}/${localFileName}`;
      this.logger.log(`Locally saved file: ${fileUrl}`);
    }

    return this.prisma.medicalRecord.create({
      data: {
        familyMemberId,
        title,
        type,
        fileUrl,
        fileSize: file.size,
        recordDate: new Date(),
      },
    });
  }

  async findAll(familyMemberId: string) {
    return this.prisma.medicalRecord.findMany({
      where: { familyMemberId },
      orderBy: { recordDate: 'desc' },
    });
  }

  async remove(id: string) {
    const record = await this.prisma.medicalRecord.findUnique({ where: { id } });
    if (!record) {
      throw new NotFoundException('Record not found');
    }

    if (this.isSupabaseConfigured && !record.fileUrl.includes('mock-storage.local')) {
      try {
        // Extract the path from the URL
        const urlParts = record.fileUrl.split('/medical_records/');
        if (urlParts.length > 1) {
          const filePath = urlParts[1];
          await this.supabase.storage.from('medical_records').remove([filePath]);
        }
      } catch (err: any) {
        this.logger.error(`Failed to delete file from Supabase: ${err.message}`);
      }
    }

    return this.prisma.medicalRecord.delete({ where: { id } });
  }
}
