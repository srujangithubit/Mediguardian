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
      
      // Transform the Python output into an array of medication objects
      const extractedMedications = [];
      const medicationNames = parsed.medications || [];
      const dosages = parsed.dosages || [];
      const frequencies = parsed.frequencies || [];
      const routes = parsed.routes || [];

      // If no medications found but we have some text, we could return empty or a generic one.
      // We will loop over however many medications were found.
      for (let i = 0; i < Math.max(medicationNames.length, 1); i++) {
        const name = medicationNames[i] || 'Unknown Medication';
        
        let dosage = 0;
        let dosageUnit = 'MG';
        if (dosages[i]) {
          const dosageStr = dosages[i];
          const match = dosageStr.match(/([\d.]+)\s*([a-zA-Z]+)/);
          if (match) {
            dosage = parseFloat(match[1]);
            dosageUnit = match[2].toUpperCase();
            
            // Map units to supported Prisma Enums (MG, ML, TABLET, CAPSULE, DROPS, UNITS, PUFFS)
            if (dosageUnit === 'G' || dosageUnit === 'GM') {
              dosage *= 1000;
              dosageUnit = 'MG';
            } else if (dosageUnit === 'MCG') {
              dosage /= 1000;
              dosageUnit = 'MG';
            } else if (!['MG', 'ML', 'TABLET', 'CAPSULE', 'DROPS', 'UNITS', 'PUFFS'].includes(dosageUnit)) {
              dosageUnit = 'MG'; // default fallback
            }
          } else {
            dosage = parseFloat(dosageStr) || 0;
          }
        }

        let frequency = 'ONCE_DAILY';
        let schedules = [{ scheduledTime: "08:00" }];
        if (frequencies[i]) {
          const freqStr = frequencies[i].toLowerCase();
          schedules = [];
          
          // Check for specific time keywords
          if (freqStr.includes('morning') || freqStr.includes('breakfast') || freqStr.includes('1-0-0')) {
            schedules.push({ scheduledTime: "08:00" });
          }
          if (freqStr.includes('afternoon') || freqStr.includes('lunch') || freqStr.includes('0-1-0')) {
            schedules.push({ scheduledTime: "14:00" });
          }
          if (freqStr.includes('evening') || freqStr.includes('night') || freqStr.includes('bedtime') || freqStr.includes('dinner') || freqStr.includes('0-0-1')) {
            schedules.push({ scheduledTime: "20:00" });
          }

          // Check for Indian dosage patterns
          if (freqStr.includes('1-1-1')) {
            schedules = [{ scheduledTime: "08:00" }, { scheduledTime: "14:00" }, { scheduledTime: "20:00" }];
          } else if (freqStr.includes('1-0-1') || freqStr.includes('1/2-0-1')) {
            schedules = [{ scheduledTime: "08:00" }, { scheduledTime: "20:00" }];
          }

          // Map length to frequency enum
          if (schedules.length === 1) frequency = 'ONCE_DAILY';
          else if (schedules.length === 2) frequency = 'TWICE_DAILY';
          else if (schedules.length === 3) frequency = 'THREE_TIMES_DAILY';
          else if (schedules.length >= 4) frequency = 'FOUR_TIMES_DAILY';

          // Fallbacks for standard medical abbreviations if no specific times were matched
          if (schedules.length === 0) {
            if (freqStr.includes('bid') || freqStr.includes('twice') || freqStr.includes('bd') || freqStr.match(/\b2\b/)) {
              frequency = 'TWICE_DAILY';
              schedules = [{ scheduledTime: "08:00" }, { scheduledTime: "20:00" }];
            } else if (freqStr.includes('tid') || freqStr.includes('three') || freqStr.includes('tds') || freqStr.match(/\b3\b/)) {
              frequency = 'THREE_TIMES_DAILY';
              schedules = [{ scheduledTime: "08:00" }, { scheduledTime: "14:00" }, { scheduledTime: "20:00" }];
            } else if (freqStr.includes('qid') || freqStr.includes('four') || freqStr.includes('qds') || freqStr.match(/\b4\b/)) {
              frequency = 'FOUR_TIMES_DAILY';
              schedules = [{ scheduledTime: "08:00" }, { scheduledTime: "12:00" }, { scheduledTime: "16:00" }, { scheduledTime: "20:00" }];
            } else if (freqStr.includes('prn') || freqStr.includes('as needed') || freqStr.includes('sos')) {
              frequency = 'AS_NEEDED';
              schedules = [];
            } else {
              frequency = 'ONCE_DAILY';
              schedules = [{ scheduledTime: "08:00" }];
            }
          }
        }

        const instructions = `Route: ${routes[i] || 'N/A'}`;

        // Only add if it's a real medication, or if it's the only one (fallback)
        if (name !== 'Unknown Medication' || medicationNames.length === 0) {
          extractedMedications.push({
            name,
            dosage,
            dosageUnit,
            frequency,
            instructions,
            schedules
          });
        }
      }

      return extractedMedications;

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
