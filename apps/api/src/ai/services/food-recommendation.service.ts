import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ContextAssemblerService } from './context-assembler.service';

@Injectable()
export class FoodRecommendationService {
  private genAI: GoogleGenerativeAI;

  constructor(private readonly contextAssembler: ContextAssemblerService) {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');
  }

  async generateRecommendations(familyMemberId: string) {
    const context = await this.contextAssembler.assembleContext(familyMemberId);
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      You are an AI nutritionist. Based on the following user context:
      ${JSON.stringify(context, null, 2)}
      
      Generate a daily meal plan (breakfast, lunch, dinner) that is healthy and avoids interactions with their active medications.
      Also, generate a smart grocery list for these meals.

      Respond STRICTLY in JSON format with exactly the following schema:
      {
        "meals": [
          {
            "type": "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK",
            "name": "string",
            "reasoning": "string"
          }
        ],
        "groceryList": [
          {
            "item": "string",
            "category": "string"
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
      console.error('Food Recommendation Error:', error.message);
      return {
        "meals": [
          {
            "type": "BREAKFAST",
            "name": "Oatmeal with berries (Mock)",
            "reasoning": "This is a simulated meal because the Gemini API key is missing. Add a valid key in the .env file."
          },
          {
            "type": "LUNCH",
            "name": "Grilled Chicken Salad (Mock)",
            "reasoning": "Simulated meal for demonstration purposes."
          }
        ],
        "groceryList": [
          { "item": "Oats", "category": "Grains" },
          { "item": "Mixed Berries", "category": "Fruits" },
          { "item": "Chicken Breast", "category": "Meat" }
        ]
      };
    }
  }
}
