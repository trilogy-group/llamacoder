import { BedrockChat } from "@langchain/community/chat_models/bedrock";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOpenAI } from "@langchain/openai";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { Runnable } from "@langchain/core/runnables";
import { perplexitySearchTool } from "../../../utils/tools";
import { systemPrompt } from "./prompt";
import util from 'util';

export const runtime = "nodejs";

const ChatModel = (model: string, tools: DynamicStructuredTool<any>[]): Runnable => {
  if(model.startsWith("anthropic")){
    const llm = new BedrockChat({
      model: "anthropic.claude-3-5-sonnet-20240620-v1:0",
      temperature: 0.2,
      region: "us-east-1",
      maxTokens: 8192,
    });
    return llm.bindTools(tools);
  } 
  else if(model.startsWith("claude")){
    const llm = new ChatAnthropic({
      model: "claude-3-5-sonnet-20240620",
      temperature: 0,
      maxTokens: 8192,
    });
    return llm.bindTools(tools);
  }
  else if(model.startsWith("gpt")){
    const llm = new ChatOpenAI({
      modelName: "gpt-4o",
      temperature: 0.2,
      maxTokens: 8192
    });
    return llm.bindTools(tools);
  }
  const llm = new BedrockChat({
    model: "anthropic.claude-3-5-sonnet-20240620-v1:0",
    temperature: 0.2,
    region: "us-east-1",
    maxTokens: 8192
  });
  return llm.bindTools(tools);
}

export async function POST(req: Request) {
  try {
    let { messages, model } = await req.json();
    console.log("Received messages: ", util.inspect(messages, { showHidden: false, depth: null, colors: true }));

    const allMessages = [
      { role: "system", content: systemPrompt },
      ...messages
    ];

    const llm = ChatModel(model, [perplexitySearchTool]);

    let response = await llm.invoke(allMessages);
    console.log("Initial response: ", response);
    allMessages.push(response);

    if ("tool_calls" in response && response.tool_calls) {
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
      allMessages.push(toolResponse);
      response = await llm.invoke(allMessages);
      allMessages.push(response);
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
      headers: {
        "Content-Type": "application/json",
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