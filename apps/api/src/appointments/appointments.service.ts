import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto, UpdateAppointmentStatusDto } from './dto/appointments.dto';
import { GoogleCalendarService } from '../integrations/google/google-calendar.service';

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly googleCalendar: GoogleCalendarService
  ) {}

  async create(dto: CreateAppointmentDto) {
    // 1. Fetch user's email to invite them to the calendar event
    const familyMember = await this.prisma.familyMember.findUnique({
      where: { id: dto.familyMemberId },
      include: {
        family: { include: { owner: true } },
        user: true
      }
    });

    const googleRefreshToken = familyMember?.user?.googleRefreshToken || familyMember?.family?.owner?.googleRefreshToken || null;

    // 2. Sync with Google Calendar
    let googleEventId = null;
    try {
      googleEventId = await this.googleCalendar.createAppointmentEvent({
        title: `Appointment: ${dto.doctorName}`,
        description: `Reason: ${dto.reason || 'Not specified'}\nNotes: ${dto.notes || 'None'}`,
        location: dto.isOnline ? dto.meetingLink || 'Online' : dto.hospitalName || dto.address || '',
        startTime: new Date(dto.appointmentDate),
        durationMinutes: dto.duration || 30, // default 30 min
      }, googleRefreshToken);
    } catch (error) {
      console.error('Failed to create google event', error);
    }

    // 3. Save to database
    return this.prisma.appointment.create({
      data: {
        ...dto,
        status: 'SCHEDULED',
        googleEventId,
      },
    });
  }

  async findAll(familyMemberId: string) {
    return this.prisma.appointment.findMany({
      where: { familyMemberId },
      orderBy: { appointmentDate: 'asc' },
    });
  }

  async updateStatus(id: string, dto: UpdateAppointmentStatusDto) {
    const appointment = await this.prisma.appointment.findUnique({ 
      where: { id },
      include: {
        familyMember: {
          include: {
            user: true,
            family: { include: { owner: true } }
          }
        }
      }
    });
    
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: { status: dto.status },
    });

    if (appointment.googleEventId && dto.status === 'CANCELLED') {
      const googleRefreshToken = appointment.familyMember?.user?.googleRefreshToken || appointment.familyMember?.family?.owner?.googleRefreshToken || null;
      // Typically we either delete the event or update its title to say "CANCELLED"
      await this.googleCalendar.updateAppointmentEvent(
        appointment.googleEventId, 
        { title: `[CANCELLED] Appointment: ${appointment.doctorName}` },
        googleRefreshToken
      );
    }

    return updated;
  }

  async remove(id: string) {
    const appointment = await this.prisma.appointment.findUnique({ 
      where: { id },
      include: {
        familyMember: {
          include: {
            user: true,
            family: { include: { owner: true } }
          }
        }
      }
    });

    if (appointment?.googleEventId) {
      const googleRefreshToken = appointment.familyMember?.user?.googleRefreshToken || appointment.familyMember?.family?.owner?.googleRefreshToken || null;
      await this.googleCalendar.deleteAppointmentEvent(appointment.googleEventId, googleRefreshToken);
    }
    return this.prisma.appointment.delete({ where: { id } });
  }
}
