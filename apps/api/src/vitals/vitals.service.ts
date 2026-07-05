import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBloodPressureDto, CreateSugarLogDto, CreateWeightLogDto } from './dto/vitals.dto';

@Injectable()
export class VitalsService {
  constructor(private readonly prisma: PrismaService) {}

  // --- Blood Pressure ---
  async createBp(dto: CreateBloodPressureDto) {
    return this.prisma.bloodPressureLog.create({ data: dto });
  }

  async getBpLogs(familyMemberId: string) {
    return this.prisma.bloodPressureLog.findMany({
      where: { familyMemberId },
      orderBy: { measuredAt: 'desc' },
    });
  }

  // --- Blood Sugar ---
  async createSugar(dto: CreateSugarLogDto) {
    return this.prisma.sugarLog.create({ data: dto });
  }

  async getSugarLogs(familyMemberId: string) {
    return this.prisma.sugarLog.findMany({
      where: { familyMemberId },
      orderBy: { measuredAt: 'desc' },
    });
  }

  // --- Weight ---
  async createWeight(dto: CreateWeightLogDto) {
    let bmi = null;
    if (dto.heightCm) {
      const heightM = dto.heightCm / 100;
      bmi = dto.weightKg / (heightM * heightM);
    }

    return this.prisma.weightLog.create({
      data: {
        ...dto,
        bmi,
      },
    });
  }

  async getWeightLogs(familyMemberId: string) {
    return this.prisma.weightLog.findMany({
      where: { familyMemberId },
      orderBy: { measuredAt: 'desc' },
    });
  }

  // --- Analytics Summary ---
  async getSummary(familyMemberId: string) {
    const bpLogs = await this.getBpLogs(familyMemberId);
    const sugarLogs = await this.getSugarLogs(familyMemberId);
    
    let bpStatus = 'NORMAL';
    if (bpLogs.length > 0) {
      const latest = bpLogs[0];
      if (latest.systolic > 180 || latest.diastolic > 120) bpStatus = 'CRITICAL_HIGH';
      else if (latest.systolic > 140 || latest.diastolic > 90) bpStatus = 'HIGH';
      else if (latest.systolic < 90 || latest.diastolic < 60) bpStatus = 'LOW';
    }

    let sugarStatus = 'NORMAL';
    if (sugarLogs.length > 0) {
      const latest = sugarLogs[0];
      if (latest.glucoseLevel > 200) sugarStatus = 'HIGH';
      else if (latest.glucoseLevel < 70) sugarStatus = 'LOW';
    }

    // Averages could be calculated here, keeping it simple for the mock
    const avgSystolic = bpLogs.length > 0 ? Math.round(bpLogs.reduce((a, b) => a + b.systolic, 0) / bpLogs.length) : null;
    const avgDiastolic = bpLogs.length > 0 ? Math.round(bpLogs.reduce((a, b) => a + b.diastolic, 0) / bpLogs.length) : null;
    const avgSugar = sugarLogs.length > 0 ? Math.round(sugarLogs.reduce((a, b) => a + b.glucoseLevel, 0) / sugarLogs.length) : null;

    return {
      bp: {
        status: bpStatus,
        latest: bpLogs[0] || null,
        average: avgSystolic ? `${avgSystolic}/${avgDiastolic}` : null,
        totalReadings: bpLogs.length
      },
      sugar: {
        status: sugarStatus,
        latest: sugarLogs[0] || null,
        average: avgSugar,
        totalReadings: sugarLogs.length
      }
    };
  }
}
