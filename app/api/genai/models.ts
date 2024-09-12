import { BedrockChat } from "@langchain/community/chat_models/bedrock";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOpenAI } from "@langchain/openai";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { Runnable } from "@langchain/core/runnables";

export const runtime = "nodejs";

export const ChatModel = (model: string, tools: DynamicStructuredTool<any>[]): Runnable => {
    if (model.startsWith("bedrock")) {
        const llm = new BedrockChat({
            model: "anthropic.claude-3-5-sonnet-20240620-v1:0",
            temperature: 0.2,
            region: "us-east-1",
            maxTokens: 8192,
        });
        return tools && tools.length > 0 ? llm.bindTools(tools) : llm;
    }
    else if (model.startsWith("claude")) {
        const llm = new ChatAnthropic({
            model: "claude-3-5-sonnet-20240620",
            temperature: 0,
            maxTokens: 8192,
        });
        return tools && tools.length > 0 ? llm.bindTools(tools) : llm;
    }
    else if (model.startsWith("gpt")) {
        const llm = new ChatOpenAI({
            modelName: "gpt-4o",
            temperature: 0.2,
            maxTokens: 8192
        });
        return tools && tools.length > 0 ? llm.bindTools(tools) : llm;
    }
    const llm = new BedrockChat({
        model: "anthropic.claude-3-5-sonnet-20240620-v1:0",
        temperature: 0.2,
        region: "us-east-1",
        maxTokens: 8192
    });
    return tools && tools.length > 0 ? llm.bindTools(tools) : llm;
}