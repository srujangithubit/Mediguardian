import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ContextAssemblerService } from './context-assembler.service';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class DigitalTwinService {
  private genAI: GoogleGenerativeAI;

  constructor(
    private readonly prisma: PrismaService,
    private readonly contextAssembler: ContextAssemblerService,
  ) {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');
  }

  async updateDigitalTwin(familyMemberId: string, lat = 0, lon = 0) {
    const aiContext = await this.contextAssembler.assembleContext(familyMemberId, lat, lon);

    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
      You are MediGuardian AI's Digital Twin engine. 
      Analyze the following patient context:
      ${JSON.stringify(aiContext, null, 2)}
      
      Respond STRICTLY in JSON format with exactly the following schema:
      {
        "healthScore": <number 0-100 based on compliance and vitals>,
        "riskLevel": <"LOW" | "MEDIUM" | "HIGH">,
        "averageSleep": <number or 7.0 if unknown>,
        "currentTrends": [ { "metric": "string", "trend": "string" } ],
        "recommendations": [ "string" ]
      }
      Do not include any markdown formatting, only the JSON.
    `;

    try {
      const result = await model.generateContent(prompt);
      let text = result.response.text().trim();
      if (text.startsWith('\`\`\`json')) {
        text = text.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
      }
      
      const parsed = JSON.parse(text);

      const updatedTwin = await this.prisma.digitalTwinProfile.upsert({
        where: { familyMemberId },
        update: {
          healthScore: parsed.healthScore,
          riskLevel: parsed.riskLevel,
          averageSleep: parsed.averageSleep,
          currentTrends: parsed.currentTrends,
          recommendations: parsed.recommendations,
          medicationCompliance: aiContext.complianceRate,
          lastUpdated: new Date(),
        },
        create: {
          familyMemberId,
          healthScore: parsed.healthScore,
          riskLevel: parsed.riskLevel,
          averageSleep: parsed.averageSleep,
          currentTrends: parsed.currentTrends,
          recommendations: parsed.recommendations,
          medicationCompliance: aiContext.complianceRate,
        },
      });

      return updatedTwin;
    } catch (error) {
      console.error('Digital Twin Generation Error:', error);
      throw new Error('Failed to update Digital Twin Profile');
    }
  }
}
