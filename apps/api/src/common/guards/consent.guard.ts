import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CONSENT_KEY, ConsentType } from '../decorators/consent-required.decorator';

@Injectable()
export class ConsentGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredConsent = this.reflector.getAllAndOverride<ConsentType>(CONSENT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredConsent) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    // In a real application, you'd check a `ConsentRecord` table here for the user
    // e.g., const hasConsent = await this.prisma.consentRecord.findFirst(...)
    
    // Simulating consent check: Assume successful unless they explicitly lack permission in a mocked token
    const user = request.user || { id: 'mock-user-id' }; 
    const mockedConsents = [ConsentType.MEDICAL_RECORDS, ConsentType.WEARABLE_DATA, ConsentType.AI_ANALYSIS];
    
    if (!mockedConsents.includes(requiredConsent)) {
      throw new ForbiddenException(`User has not consented to ${requiredConsent}`);
    }

    return true;
  }
}
