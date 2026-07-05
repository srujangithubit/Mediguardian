import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  private getSecret(): string {
    return process.env.JWT_SECRET || 'mediguardian-dev-secret';
  }

  private signToken(userId: string, email: string): string {
    return jwt.sign(
      { sub: userId, email },
      this.getSecret(),
      { expiresIn: '7d' },
    );
  }

  async registerUser(dto: RegisterDto) {
    // Check if user already exists
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 12);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        fullName: dto.fullName,
        passwordHash,
        phone: dto.phone,
      },
    });

    // Auto-create a default family and member for the new user
    const family = await this.prisma.family.create({
      data: {
        name: `${dto.fullName}'s Family`,
        ownerId: user.id,
        members: {
          create: {
            fullName: dto.fullName,
            userId: user.id,
            role: 'OWNER',
          },
        },
      },
      include: { members: true },
    });

    const token = this.signToken(user.id, user.email);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
      },
      family: {
        id: family.id,
        name: family.name,
        members: family.members,
      },
    };
  }

  async loginUser(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.signToken(user.id, user.email);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        families: {
          include: {
            family: {
              include: {
                members: true,
              },
            },
          },
        },
        ownedFamilies: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Gather all family members from all families this user owns or belongs to
    const allFamilies = [
      ...user.ownedFamilies.map(f => ({
        id: f.id,
        name: f.name,
        members: f.members,
      })),
    ];

    // Also include families from membership (avoiding duplicates)
    for (const membership of user.families) {
      if (!allFamilies.find(f => f.id === membership.family.id)) {
        allFamilies.push({
          id: membership.family.id,
          name: membership.family.name,
          members: membership.family.members,
        });
      }
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        bloodGroup: user.bloodGroup,
        phone: user.phone,
      },
      families: allFamilies,
    };
  }
}
