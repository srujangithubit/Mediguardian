import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ContextAssemblerService } from './context-assembler.service';

@Injectable()
export class CopilotService {
  private genAI: GoogleGenerativeAI;

  constructor(private readonly contextAssembler: ContextAssemblerService) {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');
  }

  async chat(familyMemberId: string, message: string, history: any[] = []) {
    const aiContext = await this.contextAssembler.assembleContext(familyMemberId);
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = `
      You are Health Copilot, a helpful and empathetic AI assistant for MediGuardian AI.
      You assist users with their family's health data.
      Here is the current context for the user:
      ${JSON.stringify(aiContext, null, 2)}
      
      Always answer concisely, refer to the data provided, and remind them you are an AI, not a doctor, if they ask for medical advice.
    `;

    // Initialize chat with system instruction context
    const chatSession = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'Understood. I will use this context to assist the user safely.' }] },
        ...history,
      ],
    });

    try {
      const result = await chatSession.sendMessage(message);
      return {
        reply: result.response.text(),
      };
    } catch (error) {
      console.error('Copilot Chat Error:', error);
      throw new Error('Failed to communicate with Copilot');
    }
  }
}
