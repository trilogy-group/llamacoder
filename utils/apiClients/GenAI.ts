import { Message } from '@/types/Message';
import { Dependency } from '@/types/Artifact';

export const genAiApi = {
  generateResponse: async (
    messages: Message[],
    onChunk: (chunks: { index: number; type: string; text: string }[]) => void
  ): Promise<{ code: string; dependencies: Dependency[] }> => {
    console.log("Generating response with messages:", messages);

    // Process messages to include attachment contents
    const processedMessages = await Promise.all(messages.map(async (message) => {
      if (message.attachments && message.attachments.length > 0) {
        let attachmentContent = "\n\nAdditional context from attachments:\n";
        for (const attachment of message.attachments) {
          try {
            const response = await fetch(attachment.url);
            const content = await response.text();
            attachmentContent += `\nContent of ${attachment.fileName}:\n${content}\n`;
          } catch (error) {
            console.error(`Error reading attachment ${attachment.fileName}:`, error);
            attachmentContent += `\nError reading content of ${attachment.fileName}\n`;
          }
        }
        return { ...message, text: message.text + attachmentContent };
      }
      return message;
    }));

    console.log("Processed messages:", processedMessages);

    const response = await fetch('/api/genai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages: processedMessages }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate AI response');
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    const decoder = new TextDecoder();
    let fullResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);      
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonData = JSON.parse(line.slice(6));
          const chunks = JSON.parse(jsonData.content);
          for (const chunk of chunks) {
            fullResponse += chunk.text;
          }
          onChunk(chunks);
        }
      }
    }

    const parsedResponse = parseResponse(fullResponse);
    return {
      code: parsedResponse.CODE || '',
      dependencies: parseExtraLibraries(parsedResponse.EXTRA_LIBRARIES || ''),
    };
  },
};

function parseResponse(response: string): Record<string, string> {
  const result: Record<string, string> = {};
  const sections = ['ANALYSIS', 'EXTRA_LIBRARIES', 'CODE', 'VERIFICATION'];

  for (const section of sections) {
    const content = extractContent(response, section);
    if (content) {
      result[section] = content;
    }
  }

  return result;
}

export function extractContent(text: string, tag: string): string | null {
  const openTag = `<${tag}>`;
  const closeTag = `</${tag}>`;
  const startIndex = text.indexOf(openTag);

  if (startIndex === -1) return null;

  const endIndex = text.indexOf(closeTag, startIndex + openTag.length);

  if (endIndex === -1) {
    // If closing tag is not found, return everything after the opening tag
    return text.slice(startIndex + openTag.length).trim();
  } else {
    // If both tags are found, return content between them
    return text.slice(startIndex + openTag.length, endIndex).trim();
  }
}

function parseExtraLibraries(extraLibrariesString: string): Dependency[] {
  const libraries: Dependency[] = [];
  const libraryRegex = /<LIBRARY>\s*<NAME>(.*?)<\/NAME>\s*<VERSION>(.*?)<\/VERSION>\s*<\/LIBRARY>/g;
  let match;

  while ((match = libraryRegex.exec(extraLibrariesString)) !== null) {
    libraries.push({
      name: match[1],
      version: match[2],
    });
  }

  return libraries;
}
