import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CabinetService } from '../medications/cabinet/cabinet.service';

@Injectable()
export class CalendarService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cabinetService: CabinetService,
  ) {}

  async getFamilyCalendar(familyId: string, startDateStr: string, endDateStr: string) {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    const familyMembers = await this.prisma.familyMember.findMany({
      where: { familyId },
      select: { id: true, fullName: true },
    });
    const memberIds = familyMembers.map(m => m.id);

    // 1. Appointments
    const appointments = await this.prisma.appointment.findMany({
      where: {
        familyMemberId: { in: memberIds },
        appointmentDate: { gte: startDate, lte: endDate },
      },
      include: { familyMember: { select: { fullName: true } } },
    });

    // 2. Calendar Events (Checkups, etc)
    const events = await this.prisma.calendarEvent.findMany({
      where: {
        familyMemberId: { in: memberIds },
        startDate: { gte: startDate, lte: endDate },
      },
      include: { familyMember: { select: { fullName: true } } },
    });

    // 3. Medication Refills (from Cabinet logic)
    const cabinetStatus = await this.cabinetService.getCabinetStatus(familyId);
    const refills = [];
    
    for (const med of cabinetStatus) {
      if (med.cabinetInsights?.predictedFinishDate) {
        const refillDate = new Date(med.cabinetInsights.predictedFinishDate);
        if (refillDate >= startDate && refillDate <= endDate) {
          refills.push({
            id: `refill-${med.id}`,
            type: 'REFILL',
            title: `Refill ${med.name}`,
            date: refillDate,
            familyMemberName: med.familyMemberId, // Can map to actual name if needed
            isUrgent: med.cabinetInsights.needsRefill,
          });
        }
      }
    }

    // Aggregate
    const unifiedCalendar = [
      ...appointments.map(a => ({ type: 'APPOINTMENT', date: a.appointmentDate, data: a })),
      ...events.map(e => ({ type: 'EVENT', date: e.startDate, data: e })),
      ...refills.map(r => ({ type: 'REFILL', date: r.date, data: r }))
    ];

    return unifiedCalendar.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
}
