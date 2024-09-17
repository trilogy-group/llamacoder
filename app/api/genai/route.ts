import { perplexitySearchTool } from "../../../utils/tools";
import { systemPrompt } from "./prompt";
import util from 'util';
import { BaseMessageChunk } from "@langchain/core/messages";
import { concat } from "@langchain/core/utils/stream";
import { ChatModel } from "./models";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    let { messages, modelName } = await req.json();
    console.log("Received messages: ", util.inspect(messages, { showHidden: false, depth: null, colors: true }));
    console.log("Received modelName: ", modelName);

    messages = messages.map((message: { role: string, content: any[] }) => ({
      role: message.role,
      content: message.content,
    }));

    const allMessages = [
      { role: "system", content: systemPrompt },
      ...messages
    ];

    const llmWithTools = ChatModel(modelName, []); // ChatModel(model, [perplexitySearchTool]);
    console.log("Using llm: ", llmWithTools);
    
    const stream = new ReadableStream({
      async start(controller) {
        const sendChunk = (chunk: string) => {
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
        };

        const streamResponse = async (response: AsyncIterable<BaseMessageChunk>) => {
          let gathered = undefined;

          for await (const chunk of response) {
            gathered = gathered !== undefined ? concat(gathered, chunk) : chunk;

            if (chunk.content) {
              sendChunk(typeof chunk.content === 'string' ? JSON.stringify([{ 'index': 0, 'text': chunk.content, 'type': 'text_delta' }]) : JSON.stringify(chunk.content));
            }
          }

          return gathered;
        }

        let responseStream = await llmWithTools.stream(allMessages);
        let response = await streamResponse(responseStream);

        let toolCalls = 0;
        while (response && 'tool_calls' in response && response.tool_calls) {
          const tool_calls = response.tool_calls as any[];
          if (tool_calls.length === 0) {
            break;
          }
          toolCalls++;
          const toolCall = tool_calls[0];
          const toolResponse = await perplexitySearchTool.invoke(toolCall);
          allMessages.push(toolResponse);
          responseStream = await llmWithTools.stream(allMessages);
          response = await streamResponse(responseStream);
          allMessages.push(response);
        }

        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Error in POST /api/generateCode:", error);
    return new Response(JSON.stringify({ error: "An error occurred while processing your request" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}