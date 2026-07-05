export interface WearableSyncResult {
  vitals: {
    heartRate?: number;
    systolic?: number;
    diastolic?: number;
    bloodSugar?: number;
  };
  activity: {
    steps?: number;
    caloriesBurned?: number;
  };
  sleep: {
    durationHours?: number;
    qualityScore?: number;
  };
  timestamp: Date;
}

export interface WearableAdapter {
  /**
   * Authenticate with the wearable provider.
   */
  authenticate(authCode: string): Promise<boolean>;

  /**
   * Sync health data from the wearable for a specific time range.
   */
  syncData(userId: string, startDate: Date, endDate: Date): Promise<WearableSyncResult[]>;
}
