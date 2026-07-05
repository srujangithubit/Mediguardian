import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async globalSearch(familyId: string, query: string) {
    if (!query || query.trim().length === 0) {
      return { members: [], medications: [] };
    }

    const searchStr = query.trim();

    // 1. Search Family Members
    const members = await this.prisma.familyMember.findMany({
      where: {
        familyId,
        OR: [
          { fullName: { contains: searchStr, mode: 'insensitive' } },
          { medicalNotes: { contains: searchStr, mode: 'insensitive' } }
        ]
      }
    });

    // 2. Search Medications (owned by family members in the family)
    const medications = await this.prisma.medication.findMany({
      where: {
        familyMember: {
          familyId,
        },
        OR: [
          { name: { contains: searchStr, mode: 'insensitive' } },
          { genericName: { contains: searchStr, mode: 'insensitive' } },
          { brandName: { contains: searchStr, mode: 'insensitive' } },
          { instructions: { contains: searchStr, mode: 'insensitive' } },
        ]
      },
      include: {
        familyMember: { select: { fullName: true } }
      }
    });

    return {
      query: searchStr,
      results: {
        members,
        medications,
      }
    };
  }
}
