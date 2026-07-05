import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class MedicineIdentifierService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');
  }

  async identifyMedicine(base64Image: string, mimeType: string) {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      Analyze this image of a pill or prescription label. 
      Identify the medication name and dosage. 
      Respond STRICTLY in JSON format with exactly the following schema:
      {
        "name": "Medication Name",
        "dosage": "Dosage Amount (e.g., 500)",
        "dosageUnit": "Dosage Unit (e.g., MG)",
        "confidence": <number 0-100>
      }
      Do not include markdown or other text.
    `;

    try {
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Image,
            mimeType,
          },
        },
      ]);
      
      let text = result.response.text().trim();
      if (text.startsWith('\`\`\`json')) {
        text = text.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
      }
      
      return JSON.parse(text);
    } catch (error) {
      console.error('Medicine Identifier Error:', error);
      throw new Error('Failed to identify medicine');
    }
  }
}
