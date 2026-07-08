import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class MedicineChatService {
  private readonly FASTAPI_URL = 'http://127.0.0.1:8000/chat';

  async chat(query: string, history: any[] = []) {
    try {
      const response = await fetch(this.FASTAPI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          history,
        }),
      });

      if (!response.ok) {
        throw new Error(`FastAPI responded with status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in MedicineChatService:', error);
      throw new HttpException('Failed to connect to local AI engine.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
