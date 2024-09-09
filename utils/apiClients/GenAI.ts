import { Message } from '@/types/Message';

export const genAiApi = {
  generateResponse: async (messages: Message[], onChunk: (chunk: any[]) => void): Promise<void> => {
    const response = await fetch('/api/genai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate AI response');
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonData = JSON.parse(line.slice(6));
          onChunk(JSON.parse(jsonData.content));
        }
      }
    }
  },
};
