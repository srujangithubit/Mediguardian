import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAggregatedStats(familyMemberId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Med Compliance
    const logs = await this.prisma.medicationLog.findMany({
      where: { familyMemberId, scheduledTime: { gte: thirtyDaysAgo } },
    });
    const totalLogs = logs.length;
    const takenLogs = logs.filter(l => l.status === 'TAKEN').length;
    const complianceRate = totalLogs > 0 ? (takenLogs / totalLogs) * 100 : 100;

    // Vitals averages
    const bpLogs = await this.prisma.bloodPressureLog.findMany({
      where: { familyMemberId, measuredAt: { gte: thirtyDaysAgo } },
    });
    const avgSystolic = bpLogs.length ? bpLogs.reduce((acc, log) => acc + log.systolic, 0) / bpLogs.length : null;
    const avgDiastolic = bpLogs.length ? bpLogs.reduce((acc, log) => acc + log.diastolic, 0) / bpLogs.length : null;

    const sugarLogs = await this.prisma.sugarLog.findMany({
      where: { familyMemberId, measuredAt: { gte: thirtyDaysAgo } },
    });
    const avgSugar = sugarLogs.length ? sugarLogs.reduce((acc, log) => acc + log.glucoseLevel, 0) / sugarLogs.length : null;

    return {
      complianceRate,
      vitals: {
        avgSystolic,
        avgDiastolic,
        avgSugar,
      },
      timeframe: '30_DAYS'
    };
  }
}
