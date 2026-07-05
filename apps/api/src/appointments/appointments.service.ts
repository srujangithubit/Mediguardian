import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto, UpdateAppointmentStatusDto } from './dto/appointments.dto';

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAppointmentDto) {
    return this.prisma.appointment.create({
      data: {
        ...dto,
        status: 'SCHEDULED',
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
    const appointment = await this.prisma.appointment.findUnique({ where: { id } });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return this.prisma.appointment.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  async remove(id: string) {
    return this.prisma.appointment.delete({ where: { id } });
  }
}
