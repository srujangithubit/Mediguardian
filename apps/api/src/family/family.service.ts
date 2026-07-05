import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';
import { AddFamilyMemberDto, UpdateFamilyMemberDto } from './dto/family-member.dto';

@Injectable()
export class FamilyService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createFamilyDto: CreateFamilyDto, ownerId: string) {
    return this.prisma.family.create({
      data: {
        ...createFamilyDto,
        ownerId,
      },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.family.findMany({
      where: { ownerId: userId },
      include: { members: true },
    });
  }

  async findOne(id: string) {
    const family = await this.prisma.family.findUnique({
      where: { id },
      include: {
        members: true,
      },
    });
    if (!family) {
      throw new NotFoundException(`Family with ID ${id} not found`);
    }
    return family;
  }

  async update(id: string, updateFamilyDto: UpdateFamilyDto) {
    return this.prisma.family.update({
      where: { id },
      data: updateFamilyDto,
    });
  }

  // --- Family Member Management ---

  async addMember(familyId: string, addMemberDto: AddFamilyMemberDto) {
    return this.prisma.familyMember.create({
      data: {
        ...addMemberDto,
        familyId,
      },
    });
  }

  async updateMember(memberId: string, updateMemberDto: UpdateFamilyMemberDto) {
    return this.prisma.familyMember.update({
      where: { id: memberId },
      data: updateMemberDto,
    });
  }

  async removeMember(memberId: string) {
    return this.prisma.familyMember.delete({
      where: { id: memberId },
    });
  }
}
