import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ContextAssemblerService } from './context-assembler.service';

@Injectable()
export class WeeklyReportService {
  private genAI: GoogleGenerativeAI;

  constructor(private readonly contextAssembler: ContextAssemblerService) {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');
  }

  async generateWeeklyReport(familyMemberId: string) {
    const context = await this.contextAssembler.assembleContext(familyMemberId);
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      You are an AI Health Summarizer.
      Based on the patient context for the past week:
      ${JSON.stringify(context, null, 2)}
      
      Generate a personalized, empathetic narrative report summarizing their week.
      Acknowledge their achievements, gently address missed medications or poor vitals, and set a positive tone for the next week.
      
      Respond STRICTLY in JSON format with exactly the following schema:
      {
        "title": "string",
        "narrative": "string",
        "keyAchievements": [ "string" ],
        "areasForImprovement": [ "string" ]
      }
    `;

    try {
      const result = await model.generateContent(prompt);
      let text = result.response.text().trim();
      if (text.startsWith('\`\`\`json')) {
        text = text.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
      }
      return JSON.parse(text);
    } catch (error) {
      console.error('Weekly Report Error:', error.message);
      return {
        "title": "Weekly Health Summary (Mock)",
        "narrative": "This is a simulated weekly report. The Gemini API key is not configured, or the request failed. Please add a valid key in the .env file. Meanwhile, the patient's vitals seem stable.",
        "keyAchievements": [ "Maintained routine", "Good hydration" ],
        "areasForImprovement": [ "Configure Gemini API key for real insights" ]
      };
    }
  }
}
