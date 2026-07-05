import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ContextAssemblerService } from './context-assembler.service';

@Injectable()
export class CoachService {
  private genAI: GoogleGenerativeAI;

  constructor(private readonly contextAssembler: ContextAssemblerService) {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');
  }

  async generateBriefing(familyMemberId: string, timeOfDay: 'morning' | 'evening') {
    const context = await this.contextAssembler.assembleContext(familyMemberId);
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      You are an AI Health Coach.
      Generate a ${timeOfDay} health briefing for the patient based on this context:
      ${JSON.stringify(context, null, 2)}
      
      The briefing should be encouraging, highlight what they need to focus on today (e.g., meds, vitals, habits), and mention any weather-related health tips if relevant.
      
      Respond STRICTLY in JSON format with exactly the following schema:
      {
        "greeting": "string",
        "summary": "string",
        "actionItems": [ "string" ],
        "motivationalQuote": "string"
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
      console.error('Coach Briefing Error:', error);
      throw new Error('Failed to generate health briefing');
    }
  }
}
