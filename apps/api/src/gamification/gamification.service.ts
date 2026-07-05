import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GamificationService {
  constructor(private readonly prisma: PrismaService) {}

  async evaluateBadges(familyMemberId: string) {
    const badges = [];

    // Calculate streaks for habits
    const habitLogs = await this.prisma.habitLog.findMany({
      where: { habit: { familyMemberId } },
      orderBy: { completedAt: 'desc' },
    });

    if (habitLogs.length >= 7) {
      badges.push({
        id: 'habit-streak-7',
        name: '7-Day Warrior',
        description: 'Completed a habit for 7 consecutive logs.',
        icon: '🏆',
      });
    }

    // Calculate medication compliance
    const medLogs = await this.prisma.medicationLog.findMany({
      where: { familyMemberId, status: 'TAKEN' },
    });

    if (medLogs.length >= 30) {
      badges.push({
        id: 'med-master-30',
        name: 'Med Master',
        description: 'Took medications correctly 30 times.',
        icon: '💊',
      });
    }

    // Return mock badges if none earned yet
    if (badges.length === 0) {
      badges.push({
        id: 'starter',
        name: 'Beginner',
        description: 'Started your health journey.',
        icon: '🌱',
      });
    }

    return { badges };
  }
}
