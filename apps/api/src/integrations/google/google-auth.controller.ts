import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GoogleCalendarService } from './google-calendar.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../../auth/auth.guard';
import type { Response } from 'express';

@ApiTags('Google Calendar')
@Controller('google')
export class GoogleAuthController {
  constructor(
    private readonly googleCalendarService: GoogleCalendarService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('auth-url')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get Google OAuth URL for Calendar integration' })
  getAuthUrl(@Req() req: any) {
    const userId = req.user.id;
    const url = this.googleCalendarService.getAuthUrl(userId);
    return { url };
  }

  @Get('callback')
  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  async handleCallback(
    @Query('code') code: string,
    @Query('state') state: string, // State contains the userId
    @Res() res: Response
  ) {
    try {
      const tokens = await this.googleCalendarService.getTokens(code);
      
      if (tokens.refresh_token) {
        // Save to user
        await this.prisma.user.update({
          where: { id: state },
          data: { googleRefreshToken: tokens.refresh_token },
        });
      }

      // Redirect back to frontend settings or dashboard
      // Usually would come from env or similar, assuming localhost:3000 for local dev
      res.redirect('http://localhost:3000/dashboard/appointments?google=success');
    } catch (error) {
      console.error('Failed Google OAuth Callback:', error);
      res.redirect('http://localhost:3000/dashboard/appointments?google=error');
    }
  }
}
