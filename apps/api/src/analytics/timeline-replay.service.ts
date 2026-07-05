import { Injectable } from '@nestjs/common';
import { TimelineService } from '../timeline/timeline.service';

@Injectable()
export class TimelineReplayService {
  constructor(private readonly timelineService: TimelineService) {}

  async getReplayData(familyMemberId: string, startDateStr: string, endDateStr: string) {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    const replayData: Record<string, any> = {};

    // For each day in range, fetch timeline and group it
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      const dailyTimeline = await this.timelineService.getTimeline(familyMemberId, dateKey);
      
      // Map timeline sorted by ascending order for playback
      replayData[dateKey] = dailyTimeline.reverse();
    }

    return replayData;
  }
}
