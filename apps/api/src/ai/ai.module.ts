import { Module } from '@nestjs/common';
import { TimelineModule } from '../timeline/timeline.module';
import { AiController } from './ai.controller';
import { ContextAssemblerService } from './services/context-assembler.service';
import { DigitalTwinService } from './services/digital-twin.service';
import { MedicineIdentifierService } from './services/medicine-identifier.service';
import { InteractionService } from './services/interaction.service';
import { CopilotService } from './services/copilot.service';
import { FoodRecommendationService } from './services/food-recommendation.service';
import { AdaptiveReminderProcessor } from './services/adaptive-reminder.processor';
import { CoachService } from './services/coach.service';
import { RiskPredictionService } from './services/risk-prediction.service';
import { WeeklyReportService } from './services/weekly-report.service';
import { JournalService } from './services/journal.service';
import { MedicineChatService } from './services/medicine-chat.service';

@Module({
  imports: [TimelineModule],
  controllers: [AiController],
  providers: [
    ContextAssemblerService,
    DigitalTwinService,
    MedicineIdentifierService,
    InteractionService,
    CopilotService,
    FoodRecommendationService,
    AdaptiveReminderProcessor,
    CoachService,
    RiskPredictionService,
    WeeklyReportService,
    JournalService,
    MedicineChatService,
  ],
  exports: [
    ContextAssemblerService,
    DigitalTwinService,
    MedicineIdentifierService,
    InteractionService,
    CopilotService,
    FoodRecommendationService,
    AdaptiveReminderProcessor,
    CoachService,
    RiskPredictionService,
    WeeklyReportService,
    JournalService,
    MedicineChatService,
  ],
})
export class AiModule {}
