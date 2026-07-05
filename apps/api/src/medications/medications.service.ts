import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMedicationDto, UpdateMedicationDto } from './dto/medication.dto';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class MedicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMedicationDto: CreateMedicationDto) {
    const { schedules, ...medicationData } = createMedicationDto;

    return this.prisma.medication.create({
      data: {
        ...medicationData,
        schedules: schedules ? {
          create: schedules
        } : undefined,
      },
      include: {
        schedules: true,
      },
    });
  }

  async findAllByFamilyMember(familyMemberId: string) {
    return this.prisma.medication.findMany({
      where: { familyMemberId },
      include: { schedules: true },
      orderBy: { startDate: 'desc' },
    });
  }

  async findOne(id: string) {
    const med = await this.prisma.medication.findUnique({
      where: { id },
      include: { schedules: true },
    });
    if (!med) throw new NotFoundException('Medication not found');
    return med;
  }

  async update(id: string, updateMedicationDto: UpdateMedicationDto) {
    const { schedules, ...medicationData } = updateMedicationDto;

    // Simplistic schedule update: delete old ones, recreate new ones if provided
    if (schedules) {
      await this.prisma.medicationSchedule.deleteMany({
        where: { medicationId: id },
      });
    }

    return this.prisma.medication.update({
      where: { id },
      data: {
        ...medicationData,
        ...(schedules && {
          schedules: {
            create: schedules,
          },
        }),
      },
      include: { schedules: true },
    });
  }

  async remove(id: string) {
    return this.prisma.medication.delete({
      where: { id },
    });
  }

  // --- AI Prescription Scanner ---
  async processOcr(fileBase64: string) {
    let tempImagePath: string | null = null;
    let tempOutputDir: string | null = null;

    try {
      // Strip the data URL prefix if it exists (e.g. data:image/jpeg;base64,...)
      const base64Data = fileBase64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'mediguardian-ocr-'));
      tempImagePath = path.join(tempDir, 'upload.jpg');
      tempOutputDir = path.join(tempDir, 'output');
      
      await fs.writeFile(tempImagePath, buffer);
      
      // Determine the path to the python script
      const scriptPath = path.resolve(process.cwd(), 'src/ai/python/prescription_ocr.py');
      
      // Execute the python script
      const { stdout, stderr } = await execAsync(`python "${scriptPath}" -i "${tempImagePath}" -o "${tempOutputDir}"`, {
        env: { ...process.env, USERNAME: process.env.USERNAME || process.env.USER || 'mediguardian' }
      });
      
      const outputJsonPath = path.join(tempOutputDir, 'output.json');
      const outputData = await fs.readFile(outputJsonPath, 'utf8');
      
      const parsed = JSON.parse(outputData);
      
      // Transform the Python output into the expected frontend schema
      const name = parsed.medications && parsed.medications.length > 0 ? parsed.medications[0] : 'Unknown Medication';
      
      // Parse dosage like "500mg" into 500 and "MG"
      let dosage = 0;
      let dosageUnit = 'MG';
      if (parsed.dosages && parsed.dosages.length > 0) {
        const dosageStr = parsed.dosages[0];
        const match = dosageStr.match(/([\d.]+)\s*([a-zA-Z]+)/);
        if (match) {
          dosage = parseFloat(match[1]);
          dosageUnit = match[2].toUpperCase();
        } else {
          dosage = parseFloat(dosageStr) || 0;
        }
      }

      // Parse frequency like "bid" into standard format
      let frequency = 'ONCE_DAILY';
      let schedules = [{ scheduledTime: "08:00" }];
      if (parsed.frequencies && parsed.frequencies.length > 0) {
        const freqStr = parsed.frequencies[0].toLowerCase();
        if (freqStr.includes('bid') || freqStr.includes('twice') || freqStr.includes('bd')) {
          frequency = 'TWICE_DAILY';
          schedules = [{ scheduledTime: "08:00" }, { scheduledTime: "20:00" }];
        } else if (freqStr.includes('tid') || freqStr.includes('three') || freqStr.includes('tds')) {
          frequency = 'THRICE_DAILY';
          schedules = [{ scheduledTime: "08:00" }, { scheduledTime: "14:00" }, { scheduledTime: "20:00" }];
        } else if (freqStr.includes('qid') || freqStr.includes('four') || freqStr.includes('qds')) {
          frequency = 'FOUR_TIMES_DAILY';
          schedules = [{ scheduledTime: "08:00" }, { scheduledTime: "12:00" }, { scheduledTime: "16:00" }, { scheduledTime: "20:00" }];
        } else if (freqStr.includes('prn') || freqStr.includes('as needed') || freqStr.includes('sos')) {
          frequency = 'AS_NEEDED';
          schedules = [];
        }
      }

      const instructions = `Route: ${(parsed.routes || []).join(', ') || 'N/A'}`;

      return {
        name,
        dosage,
        dosageUnit,
        frequency,
        instructions,
        schedules
      };

    } catch (error) {
      console.error('Prescription OCR Error:', error);
      throw new Error('Failed to parse prescription image');
    } finally {
      // Cleanup temporary files
      if (tempImagePath) {
        try {
          await fs.unlink(tempImagePath);
        } catch (e) {}
      }
      if (tempOutputDir) {
        try {
          await fs.rm(tempOutputDir, { recursive: true, force: true });
        } catch (e) {}
      }
      if (tempImagePath) {
        try {
          await fs.rmdir(path.dirname(tempImagePath));
        } catch (e) {}
      }
    }
  }

  // --- Adherence Logging ---
  async logAdherence(
    medicationId: string, 
    data: { 
      scheduledTime: Date; 
      status: 'TAKEN' | 'MISSED' | 'SKIPPED' | 'LATE'; 
      actualTime?: Date; 
      dosageTaken?: number;
      notes?: string; 
      userId: string 
    }
  ) {
    const med = await this.prisma.medication.findUnique({
      where: { id: medicationId },
      select: { familyMemberId: true }
    });

    if (!med) throw new NotFoundException('Medication not found');

    return this.prisma.medicationLog.create({
      data: {
        medicationId,
        familyMemberId: med.familyMemberId,
        scheduledTime: data.scheduledTime,
        status: data.status,
        actualTime: data.actualTime || (data.status === 'TAKEN' ? new Date() : null),
        dosageTaken: data.dosageTaken,
        notes: data.notes,
        loggedBy: data.userId
      }
    });
  }
}
