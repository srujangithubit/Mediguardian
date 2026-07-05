import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdaptiveReminderProcessor {
  constructor(private readonly prisma: PrismaService) {}

  async suggestOptimizedTimes(familyMemberId: string) {
    // Get past 30 days of TAKEN logs
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const logs = await this.prisma.medicationLog.findMany({
      where: {
        familyMemberId,
        status: 'TAKEN',
        actualTime: { not: null },
        scheduledTime: { gte: thirtyDaysAgo },
      },
      include: { medication: true },
    });

    if (logs.length === 0) {
      return { suggestions: [], message: 'Not enough data to provide suggestions.' };
    }

    // Group by medicationId
    const grouped = logs.reduce((acc: Record<string, any>, log: any) => {
      if (!acc[log.medicationId]) {
        acc[log.medicationId] = { name: log.medication.name, logs: [] };
      }
      acc[log.medicationId].logs.push(log);
      return acc;
    }, {});

    const suggestions = [];

    for (const [medId, data] of Object.entries(grouped)) {
      const medData = data as any;
      let totalDiffMinutes = 0;

      medData.logs.forEach((log: any) => {
        const scheduled = new Date(log.scheduledTime).getTime();
        const actual = new Date(log.actualTime).getTime();
        const diffMins = (actual - scheduled) / (1000 * 60);
        totalDiffMinutes += diffMins;
      });

      const avgDiff = totalDiffMinutes / medData.logs.length;

      // If average time taken is consistently off by more than 30 mins
      if (Math.abs(avgDiff) > 30) {
        const direction = avgDiff > 0 ? 'later' : 'earlier';
        suggestions.push({
          medicationId: medId,
          medicationName: medData.name,
          currentAverageDeviationMinutes: Math.round(avgDiff),
          suggestion: `You tend to take this medication ${Math.abs(Math.round(avgDiff))} minutes ${direction} than scheduled. Consider adjusting your reminder.`
        });
      }
    }

    return {
      suggestions,
      message: suggestions.length > 0 ? 'We found some optimizations for your schedule.' : 'Your current schedule looks well optimized.',
    };
  }
}
