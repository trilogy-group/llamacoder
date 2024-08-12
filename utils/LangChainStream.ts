import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { AIMessage, HumanMessage, SystemMessage } from "langchain/schema";

export type ChatGPTAgent = "user" | "system" | "assistant";

export interface ChatGPTMessage {
  role: ChatGPTAgent;
  content: string;
}

export interface LangChainStreamPayload {
  model: string;
  messages: ChatGPTMessage[];
  temperature: number;
}

export async function LangChainStream(payload: LangChainStreamPayload) {
  const { model, messages, temperature } = payload;

  let chat;
  if (model.startsWith("claude")) {
    chat = new ChatAnthropic({
      modelName: model,
      temperature: temperature,
      streaming: true,
    });
  } else {
    chat = new ChatOpenAI({
      modelName: model,
      temperature: temperature,
      streaming: true,
    });
  }

  const langChainMessages = messages.map((message) => {
    switch (message.role) {
      case "system":
        return new SystemMessage(message.content);
      case "user":
        return new HumanMessage(message.content);
      case "assistant":
        return new AIMessage(message.content);
    }
  });

  const stream = await chat.stream(langChainMessages);

  return new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.content;
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text })}\n\n`));
      }
      controller.close();
    },
  });
}