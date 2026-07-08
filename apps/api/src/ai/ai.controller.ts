import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
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
import { UpdateDigitalTwinDto, IdentifyMedicineDto, CheckInteractionDto, CopilotChatDto, ProcessJournalDto, MedicineChatDto } from './dto/ai.dto';
import { MedicineChatService } from './services/medicine-chat.service';

@ApiTags('AI Intelligence')
@Controller('ai')
export class AiController {
  constructor(
    private readonly digitalTwin: DigitalTwinService,
    private readonly medicineIdentifier: MedicineIdentifierService,
    private readonly interactionService: InteractionService,
    private readonly copilotService: CopilotService,
    private readonly foodRecommendation: FoodRecommendationService,
    private readonly adaptiveReminder: AdaptiveReminderProcessor,
    private readonly coachService: CoachService,
    private readonly riskPrediction: RiskPredictionService,
    private readonly weeklyReport: WeeklyReportService,
    private readonly journalService: JournalService,
    private readonly medicineChatService: MedicineChatService,
  ) {}

  @Post('digital-twin')
  @ApiOperation({ summary: 'Update and retrieve Digital Twin Profile' })
  @ApiResponse({ status: 200, description: 'Digital Twin profile computed successfully' })
  async updateDigitalTwin(@Body() dto: UpdateDigitalTwinDto) {
    return this.digitalTwin.updateDigitalTwin(dto.familyMemberId, dto.lat, dto.lon);
  }

  @Post('identify-medicine')
  @ApiOperation({ summary: 'Identify medicine from an uploaded image' })
  @ApiResponse({ status: 200, description: 'Medicine identified successfully' })
  async identifyMedicine(@Body() dto: IdentifyMedicineDto) {
    return this.medicineIdentifier.identifyMedicine(dto.base64Image, dto.mimeType);
  }

  @Post('check-interaction')
  @ApiOperation({ summary: 'Check interactions for a proposed medication' })
  @ApiResponse({ status: 200, description: 'Interaction check completed' })
  async checkInteraction(@Body() dto: CheckInteractionDto) {
    return this.interactionService.checkInteractions(dto.familyMemberId, dto.proposedMedicationName);
  }

  @Post('copilot/chat')
  @ApiOperation({ summary: 'Chat with Health Copilot' })
  @ApiResponse({ status: 200, description: 'Copilot responded successfully' })
  async chat(@Body() dto: CopilotChatDto) {
    return this.copilotService.chat(dto.familyMemberId, dto.message, dto.history || []);
  }

  @Post('medicine-chat')
  @ApiOperation({ summary: 'Chat with Offline Medicine AI (RAG)' })
  @ApiResponse({ status: 200, description: 'Offline Medicine Chatbot responded successfully' })
  async medicineChat(@Body() dto: MedicineChatDto) {
    return this.medicineChatService.chat(dto.query, dto.history || []);
  }

  @Get('food-recommendations')
  @ApiOperation({ summary: 'Get AI food recommendations and grocery list' })
  @ApiQuery({ name: 'familyMemberId', required: true })
  async getFoodRecommendations(@Query('familyMemberId') familyMemberId: string) {
    return this.foodRecommendation.generateRecommendations(familyMemberId);
  }

  @Get('adaptive-reminders')
  @ApiOperation({ summary: 'Get optimized reminder times based on history' })
  @ApiQuery({ name: 'familyMemberId', required: true })
  async getAdaptiveReminders(@Query('familyMemberId') familyMemberId: string) {
    return this.adaptiveReminder.suggestOptimizedTimes(familyMemberId);
  }

  @Get('coach/briefing')
  @ApiOperation({ summary: 'Get personalized morning or evening health briefing' })
  @ApiQuery({ name: 'familyMemberId', required: true })
  @ApiQuery({ name: 'timeOfDay', required: true, enum: ['morning', 'evening'] })
  async getCoachBriefing(
    @Query('familyMemberId') familyMemberId: string,
    @Query('timeOfDay') timeOfDay: 'morning' | 'evening'
  ) {
    return this.coachService.generateBriefing(familyMemberId, timeOfDay);
  }

  @Get('risk-prediction')
  @ApiOperation({ summary: 'Get 7-day health risk prediction' })
  @ApiQuery({ name: 'familyMemberId', required: true })
  async getRiskPrediction(@Query('familyMemberId') familyMemberId: string) {
    return this.riskPrediction.predictRisks(familyMemberId);
  }

  @Get('weekly-report')
  @ApiOperation({ summary: 'Generate narrative weekly health report' })
  @ApiQuery({ name: 'familyMemberId', required: true })
  async getWeeklyReport(@Query('familyMemberId') familyMemberId: string) {
    return this.weeklyReport.generateWeeklyReport(familyMemberId);
  }

  @Post('journal')
  @ApiOperation({ summary: 'Process unstructured voice/text journal into insights' })
  @ApiResponse({ status: 200, description: 'Journal processed successfully' })
  async processJournal(@Body() dto: ProcessJournalDto) {
    return this.journalService.processJournalEntry(dto.familyMemberId, dto.text);
  }
}
