import { SetMetadata } from '@nestjs/common';

export const CONSENT_KEY = 'consent_required';

export enum ConsentType {
  MEDICAL_RECORDS = 'MEDICAL_RECORDS',
  WEARABLE_DATA = 'WEARABLE_DATA',
  AI_ANALYSIS = 'AI_ANALYSIS',
}

export const ConsentRequired = (consentType: ConsentType) => SetMetadata(CONSENT_KEY, consentType);
