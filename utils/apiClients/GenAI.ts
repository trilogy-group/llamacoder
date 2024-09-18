import { Message } from '@/types/Message';
import { Artifact, Dependency } from '@/types/Artifact';
import { Project } from '@/types/Project';
import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set the worker source for pdf.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

async function extractPdfText(url: string): Promise<string> {
  const pdf = await pdfjs.getDocument(url).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((item: any) => item.str);
    text += strings.join(' ') + '\n';
  }
  return text;
}

async function getBase64FromUrl(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      // Remove the data URL prefix to get only the base64 string
      const base64Content = base64data.split(',')[1];
      resolve(base64Content);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function extractDocxText(url: string): Promise<string> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

export const genAiApi = {
  generateResponse: async (
    messages: Message[],
    project: Project | null,
    selectedArtifact: Artifact | null,
    onChunk: (chunks: { index: number; type: string; text: string }[]) => void,
    model: string
  ): Promise<{ code: string; dependencies: Dependency[] }> => {
    if (!project || !selectedArtifact) {
      throw new Error('Project and selected artifact are required');
    }

    console.log("Generating response with messages:", messages);

    const processedMessages = await Promise.all(messages.map(async (message) => {
      const content: any[] = [{ type: "text", text: message.text }];

      if (message.attachments && message.attachments.length > 0) {
        for (const attachment of message.attachments) {
          try {
            if (attachment.fileType.startsWith('image/')) {
              const base64Data = await getBase64FromUrl(attachment.url);
              content.push({
                type: "image_url",
                image_url: {
                  url: `data:${attachment.fileType};base64,${base64Data}`,
                },
              });
            } else if (attachment.fileType === 'application/pdf') {
              const pdfText = await extractPdfText(attachment.url);
              content.push({
                type: "text",
                text: `Content of ${attachment.fileName} (PDF):\n${pdfText}`,
              });
            } else if (attachment.fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
              const docxText = await extractDocxText(attachment.url);
              content.push({
                type: "text",
                text: `Content of ${attachment.fileName} (DOCX):\n${docxText}`,
              });
            } else {
              const response = await fetch(attachment.url);
              const textContent = await response.text();
              content.push({
                type: "text",
                text: `Content of ${attachment.fileName}:\n${textContent}`,
              });
            }
          } catch (error) {
            console.error(`Error processing attachment ${attachment.fileName}:`, error);
            // content.push({
            //   type: "text",
            //   text: `Error processing attachment ${attachment.fileName}: ${error}`,
            // });
          }
        }
      }

      return { ...message, content };
    }));

    console.log("Processed messages:", processedMessages);

    const response = await fetch('/api/genai/code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages: processedMessages, modelName: model }),
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

export function parseResponse(response: string): Record<string, string> {
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

export function parseExtraLibraries(extraLibrariesString: string): Dependency[] {
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
