import { BedrockChat } from "@langchain/community/chat_models/bedrock";
import { perplexitySearchTool } from "../../../utils/tools";
import { systemPrompt } from "./prompt";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    let { messages, model } = await req.json();
    console.log("Received messages: ", messages);

    messages = [
      { role: "system", content: systemPrompt },
      ...messages
    ];
  
    const bedrock = new BedrockChat({
      model: "anthropic.claude-3-5-sonnet-20240620-v1:0",
      temperature: 0.2,
      region: "us-east-1",
      maxTokens: 8192
    });

    const llmWithTools = bedrock.bindTools([perplexitySearchTool]);

    let response = await llmWithTools.invoke(messages);
    console.log("Initial response: ", response);
    messages.push(response);

    if("tool_calls" in response && response.tool_calls) {
      console.log("Tool calls found in response");
      console.log("Tool calls: ", response.tool_calls);
    }

    let toolCalls = 0;
    while ('tool_calls' in response && response.tool_calls) {
      const tool_calls = response.tool_calls as any[];
      if (tool_calls.length === 0) {
        break;
      }
      toolCalls++;
      const toolCall = tool_calls[0];
      const toolResponse = await perplexitySearchTool.invoke(toolCall);
      messages.push(toolResponse);
      response = await llmWithTools.invoke(messages);
      messages.push(response);
    }

    const parseResponse = (response: string) => {
      const extraLibrariesMatch = response.match(/<EXTRA_LIBRARIES>([\s\S]*?)<\/EXTRA_LIBRARIES>/);
      const codeMatch = response.match(/<CODE>([\s\S]*?)<\/CODE>/);

      const extraLibraries = extraLibrariesMatch ? extraLibrariesMatch[1].match(/<LIBRARY>[\s\S]*?<\/LIBRARY>/g)?.map(lib => {
        const name = lib.match(/<NAME>(.*?)<\/NAME>/)?.[1];
        const version = lib.match(/<VERSION>(.*?)<\/VERSION>/)?.[1];
        return { name, version };
      }) : [];

      const code = codeMatch ? codeMatch[1].trim() : '';

      return { code, extraLibraries: extraLibraries || [], rawResponse: response };
    }

    const parsedResponse = parseResponse(response.content as string);

    return new Response(JSON.stringify(parsedResponse), {
      headers: new Headers({
        "Content-Type": "text/plain",
        "Cache-Control": "no-cache",
      }),
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