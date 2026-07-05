import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class InteractionService {
  private genAI: GoogleGenerativeAI;

  constructor(private readonly prisma: PrismaService) {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');
  }

  async checkInteractions(familyMemberId: string, proposedMedicationName: string) {
    // Get active medications
    const activeMedications = await this.prisma.medication.findMany({
      where: { familyMemberId, status: 'ACTIVE' },
      select: { name: true, genericName: true },
    });

    const currentMeds = activeMedications.map(m => m.genericName || m.name);

    if (currentMeds.length === 0) {
      return { hasInteractions: false, warnings: [] };
    }

    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      You are a pharmacological interaction checker AI.
      A patient is currently taking: ${currentMeds.join(', ')}.
      They are proposing to take: ${proposedMedicationName}.
      
      Check for any known severe or moderate drug-drug interactions.
      Respond STRICTLY in JSON format with exactly the following schema:
      {
        "hasInteractions": <boolean>,
        "warnings": [
          {
            "severity": <"MILD" | "MODERATE" | "SEVERE">,
            "description": "string"
          }
        ]
      }
      Do not include markdown.
    `;

    try {
      const result = await model.generateContent(prompt);
      let text = result.response.text().trim();
      if (text.startsWith('\`\`\`json')) {
        text = text.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
      }
      
      return JSON.parse(text);
    } catch (error) {
      console.error('Interaction Checker Error:', error);
      throw new Error('Failed to check interactions');
    }
  }
}
