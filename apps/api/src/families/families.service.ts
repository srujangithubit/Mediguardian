import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

@Injectable()
export class FamiliesService {
  constructor(private readonly prisma: PrismaService) {}

  // Get all members for families the user has access to
  async getMyFamilyMembers(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        families: { include: { family: true } },
        ownedFamilies: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    const familyIds = new Set([
      ...user.ownedFamilies.map(f => f.id),
      ...user.families.map(f => f.familyId),
    ]);

    return this.prisma.familyMember.findMany({
      where: { familyId: { in: Array.from(familyIds) } },
      orderBy: { role: 'asc' },
    });
  }

  // Create a new dependent
  async createDependent(userId: string, familyId: string, dto: CreateMemberDto) {
    // Verify user owns the family or has ADMIN rights
    const family = await this.prisma.family.findFirst({
      where: {
        id: familyId,
        OR: [
          { ownerId: userId },
          { members: { some: { userId, role: { in: ['OWNER', 'ADMIN'] } } } }
        ]
      }
    });

    if (!family) throw new ForbiddenException('Not authorized to add members to this family');

    return this.prisma.familyMember.create({
      data: {
        familyId,
        fullName: dto.fullName,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
        gender: dto.gender,
        bloodGroup: dto.bloodGroup,
        allergies: dto.allergies || [],
        medicalNotes: dto.medicalNotes,
        isDependent: true,
        role: 'VIEWER', // Dependents usually don't log in
      }
    });
  }

  // Update a family member
  async updateMember(userId: string, memberId: string, dto: UpdateMemberDto) {
    const member = await this.prisma.familyMember.findUnique({
      where: { id: memberId },
      include: { family: { include: { members: true } } }
    });

    if (!member) throw new NotFoundException('Member not found');

    // User can edit if they are the member, OR if they are OWNER/ADMIN of the family
    const isSelf = member.userId === userId;
    const isFamilyAdmin = member.family.ownerId === userId || 
      member.family.members.some(m => m.userId === userId && ['OWNER', 'ADMIN'].includes(m.role));

    if (!isSelf && !isFamilyAdmin) {
      throw new ForbiddenException('Not authorized to edit this member');
    }

    return this.prisma.familyMember.update({
      where: { id: memberId },
      data: {
        fullName: dto.fullName,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        gender: dto.gender,
        bloodGroup: dto.bloodGroup,
        allergies: dto.allergies,
        medicalNotes: dto.medicalNotes,
      }
    });
  }

  // Remove a family member
  async removeMember(userId: string, memberId: string) {
    const member = await this.prisma.familyMember.findUnique({
      where: { id: memberId },
      include: { family: { include: { members: true } } }
    });

    if (!member) throw new NotFoundException('Member not found');

    // Only OWNER/ADMIN can remove, and they cannot remove the original owner
    const isFamilyAdmin = member.family.ownerId === userId || 
      member.family.members.some(m => m.userId === userId && ['OWNER', 'ADMIN'].includes(m.role));

    if (!isFamilyAdmin) {
      throw new ForbiddenException('Not authorized to remove members');
    }
    
    if (member.userId === member.family.ownerId) {
      throw new ForbiddenException('Cannot remove the family owner');
    }

    return this.prisma.familyMember.delete({
      where: { id: memberId }
    });
  }
}
