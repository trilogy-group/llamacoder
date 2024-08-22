import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { AIMessage, HumanMessage, SystemMessage } from "langchain/schema";
import { BedrockChat } from "langchain/chat_models/bedrock";

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
  try {
    if (model.startsWith("claude")) {
      chat = new ChatAnthropic({
        modelName: model,
        temperature: temperature,
        streaming: true,
        anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      });
    } else if (model.startsWith("anthropic")) {
      chat = new BedrockChat({
        model: model,
        region: process.env.AWS_REGION,
        // credentials: {
        //   accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        //   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        // },
        temperature: temperature,
        streaming: true,
        maxTokens: 8000
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
        try {
          for await (const chunk of stream) {
            const text = chunk.content;
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text })}\n\n`));
          }
          controller.close();
        } catch (error) {
          console.error("Error in stream processing:", error);
          controller.error(error);
        }
      },
    });
  } catch (error) {
    console.error("Error in LangChainStream:", error);
    throw error;
  }
}