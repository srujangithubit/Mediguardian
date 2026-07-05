import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TimelineService {
  constructor(private readonly prisma: PrismaService) {}

  async getTimeline(familyMemberId: string, dateStr: string) {
    const targetDate = new Date(dateStr);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    // Fetch Medication Logs
    const medLogs = await this.prisma.medicationLog.findMany({
      where: {
        familyMemberId,
        scheduledTime: {
          gte: startOfDay,
          lte: endOfDay,
        }
      },
      include: { medication: true }
    });

    // Fetch Vitals (BP, Sugar, Weight)
    const bpLogs = await this.prisma.bloodPressureLog.findMany({
      where: {
        familyMemberId,
        measuredAt: { gte: startOfDay, lte: endOfDay }
      }
    });

    const sugarLogs = await this.prisma.sugarLog.findMany({
      where: {
        familyMemberId,
        measuredAt: { gte: startOfDay, lte: endOfDay }
      }
    });

    const weightLogs = await this.prisma.weightLog.findMany({
      where: {
        familyMemberId,
        measuredAt: { gte: startOfDay, lte: endOfDay }
      }
    });

    // Fetch Habit Logs
    const habitLogs = await this.prisma.habitLog.findMany({
      where: {
        habit: { familyMemberId },
        completedAt: { gte: startOfDay, lte: endOfDay }
      },
      include: { habit: true }
    });

    // Aggregate & Sort
    const timeline = [
      ...medLogs.map(log => ({ type: 'MEDICATION', timestamp: log.actualTime || log.scheduledTime, data: log })),
      ...bpLogs.map(log => ({ type: 'BLOOD_PRESSURE', timestamp: log.measuredAt, data: log })),
      ...sugarLogs.map(log => ({ type: 'BLOOD_SUGAR', timestamp: log.measuredAt, data: log })),
      ...weightLogs.map(log => ({ type: 'WEIGHT', timestamp: log.measuredAt, data: log })),
      ...habitLogs.map(log => ({ type: 'HABIT', timestamp: log.completedAt, data: log }))
    ];

    return timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}
