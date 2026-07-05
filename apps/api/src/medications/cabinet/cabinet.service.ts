import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CabinetService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves the medicine cabinet status for a family, including inventory and expiry warnings.
   */
  async getCabinetStatus(familyId: string) {
    const familyMembers = await this.prisma.familyMember.findMany({
      where: { familyId },
      select: { id: true },
    });
    
    const memberIds = familyMembers.map(fm => fm.id);

    const medications = await this.prisma.medication.findMany({
      where: {
        familyMemberId: { in: memberIds },
        status: 'ACTIVE',
      },
      include: {
        schedules: true,
      },
    });

    const today = new Date();
    const result = medications.map(med => {
      // Expiry/End date warning (if end date is within 30 days)
      let isExpiringSoon = false;
      let daysUntilExpiry = null;
      if (med.endDate) {
        const end = new Date(med.endDate);
        const diffTime = end.getTime() - today.getTime();
        daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
      }

      // Restock Prediction Engine
      let predictedFinishDate: Date | null = null;
      let daysRemaining = null;
      let needsRefill = false;

      if (med.remainingQty !== null && med.remainingQty !== undefined && med.schedules.length > 0) {
        // Calculate daily consumption based on schedules
        const dailyDoseCount = med.schedules.length; // Assuming each schedule = 1 dose
        const dailyConsumption = dailyDoseCount * med.dosage;

        if (dailyConsumption > 0) {
          daysRemaining = Math.floor(med.remainingQty / dailyConsumption);
          const finishDate = new Date();
          finishDate.setDate(finishDate.getDate() + daysRemaining);
          predictedFinishDate = finishDate;
          
          needsRefill = med.refillThreshold ? med.remainingQty <= med.refillThreshold : daysRemaining <= 7;
        }
      }

      return {
        ...med,
        cabinetInsights: {
          isExpiringSoon,
          daysUntilExpiry,
          daysRemaining,
          predictedFinishDate,
          needsRefill,
        }
      };
    });

    return result;
  }
}
