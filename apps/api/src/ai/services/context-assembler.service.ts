import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TimelineService } from '../../timeline/timeline.service';

@Injectable()
export class ContextAssemblerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly timelineService: TimelineService,
  ) {}

  async assembleContext(familyMemberId: string, lat = 0, lon = 0) {
    const today = new Date();

    // 1. Active Medications
    const activeMedications = await this.prisma.medication.findMany({
      where: { familyMemberId, status: 'ACTIVE' },
      select: { name: true, dosage: true, dosageUnit: true, frequency: true },
    });

    // 2. Recent Vitals (Last 7 days)
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const bpLogs = await this.prisma.bloodPressureLog.findMany({
      where: { familyMemberId, measuredAt: { gte: sevenDaysAgo } },
      orderBy: { measuredAt: 'desc' },
      take: 5,
    });
    const sugarLogs = await this.prisma.sugarLog.findMany({
      where: { familyMemberId, measuredAt: { gte: sevenDaysAgo } },
      orderBy: { measuredAt: 'desc' },
      take: 5,
    });

    // 3. Today's Timeline
    const dateStr = today.toISOString().split('T')[0];
    const todayTimeline = await this.timelineService.getTimeline(familyMemberId, dateStr);

    // 4. Compliance Metrics
    const pastLogs = await this.prisma.medicationLog.findMany({
      where: { familyMemberId, scheduledTime: { gte: sevenDaysAgo, lte: today } },
    });
    const totalLogs = pastLogs.length;
    const takenLogs = pastLogs.filter(l => l.status === 'TAKEN').length;
    const complianceRate = totalLogs > 0 ? (takenLogs / totalLogs) * 100 : 100;

    // 5. Open-Meteo Weather (Simple Integration)
    let weather = null;
    try {
      if (lat !== 0 && lon !== 0) {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
        const res = await fetch(url);
        if (res.ok) {
          weather = await res.json();
        }
      }
    } catch (e) {
      console.error('Weather fetch error', e);
    }

    return {
      activeMedications,
      recentVitals: { bpLogs, sugarLogs },
      todayTimeline,
      complianceRate,
      weather: weather?.current_weather || null,
      timestamp: today.toISOString(),
    };
  }
}
