import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class ShareService {
  private readonly SECRET = process.env.SHARE_SECRET || 'fallback-secret-key-do-not-use-in-prod';

  async generateShareLink(familyMemberId: string, daysValid: number) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + daysValid);

    const payload = JSON.stringify({
      familyMemberId,
      expiresAt: expiresAt.toISOString(),
    });

    // Create a simple HMAC signature
    const hmac = crypto.createHmac('sha256', this.SECRET);
    hmac.update(payload);
    const signature = hmac.digest('hex');

    const token = Buffer.from(`${payload}::${signature}`).toString('base64');
    
    return {
      shareLink: `/share/${token}`,
      token,
      expiresAt,
    };
  }

  async validateShareToken(token: string) {
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const [payloadStr, signature] = decoded.split('::');

      // Verify signature
      const hmac = crypto.createHmac('sha256', this.SECRET);
      hmac.update(payloadStr);
      const expectedSignature = hmac.digest('hex');

      if (signature !== expectedSignature) {
        throw new UnauthorizedException('Invalid share token signature');
      }

      const payload = JSON.parse(payloadStr);

      if (new Date(payload.expiresAt) < new Date()) {
        throw new UnauthorizedException('Share token has expired');
      }

      return payload.familyMemberId;
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired share token');
    }
  }
}
