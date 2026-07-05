import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ContextAssemblerService } from './context-assembler.service';

@Injectable()
export class RiskPredictionService {
  private genAI: GoogleGenerativeAI;

  constructor(private readonly contextAssembler: ContextAssemblerService) {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');
  }

  async predictRisks(familyMemberId: string) {
    const context = await this.contextAssembler.assembleContext(familyMemberId);
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      You are an AI Health Risk Forecaster.
      Analyze the following patient context:
      ${JSON.stringify(context, null, 2)}
      
      Generate a 7-day forecast identifying potential health risks (e.g., predicted non-compliance, adverse weather impacts, worsening vital trends).
      
      Respond STRICTLY in JSON format with exactly the following schema:
      {
        "overallRisk": "LOW" | "MEDIUM" | "HIGH",
        "predictedIssues": [
          {
            "dayOffset": <number 1-7>,
            "riskCategory": "string",
            "description": "string",
            "mitigationAdvice": "string"
          }
        ]
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
      console.error('Risk Prediction Error:', error.message);
      return {
        "overallRisk": "LOW",
        "predictedIssues": [
          {
            "dayOffset": 3,
            "riskCategory": "API Configuration (Mock)",
            "description": "Simulated risk: The Gemini API key is missing or invalid in your .env file.",
            "mitigationAdvice": "Add a valid GEMINI_API_KEY to your .env file for real insights."
          }
        ]
      };
    }
  }
}
