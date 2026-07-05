import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class JournalService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');
  }

  async processJournalEntry(familyMemberId: string, text: string) {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      You are an AI Health Journal Processor.
      Process the following unstructured health journal entry (which may be transcribed from voice):
      "${text}"
      
      Extract structured insights from the entry.
      
      Respond STRICTLY in JSON format with exactly the following schema:
      {
        "sentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
        "symptomsMentioned": [ "string" ],
        "medicationsMentioned": [ "string" ],
        "missedMedications": [ "string" ],
        "generalSummary": "string",
        "requiresAttention": <boolean>
      }
    `;

    try {
      const result = await model.generateContent(prompt);
      let responseText = result.response.text().trim();
      if (responseText.startsWith('\`\`\`json')) {
        responseText = responseText.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
      }
      return JSON.parse(responseText);
    } catch (error) {
      console.error('Journal Processor Error:', error);
      throw new Error('Failed to process journal entry');
    }
  }
}
