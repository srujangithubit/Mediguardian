import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmergencyService {
  constructor(private readonly prisma: PrismaService) {}

  async getEmergencyProfile(familyMemberId: string) {
    const profile = await this.prisma.familyMember.findUnique({
      where: { id: familyMemberId },
      select: {
        id: true,
        fullName: true,
        dateOfBirth: true,
        bloodGroup: true,
        allergies: true,
        medicalNotes: true,
        emergencyContacts: true,
        medications: {
          where: { status: 'ACTIVE' },
          select: {
            name: true,
            dosage: true,
            dosageUnit: true,
            frequency: true,
            instructions: true,
          }
        }
      }
    });

    if (!profile) {
      throw new NotFoundException('Family member not found');
    }

    return profile;
  }
}
