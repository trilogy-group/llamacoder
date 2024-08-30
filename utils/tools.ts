import { tool } from "@langchain/core/tools";
import { z } from "zod";
import axios from 'axios';

const perplexitySearchSchema = z.object({
    query: z.string().describe("The search query to send to Perplexity."),
});

export const perplexitySearchTool = tool(
    async ({ query }) => {
        try {
            const response = await axios.post('https://api.perplexity.ai/chat/completions', {
                model: 'llama-3.1-sonar-small-128k-online',
                messages: [
                    { role: 'system', content: 'Your response must be thorough and detailed. Provide the most accurate and helpful information possible with code snippets where possible.' },
                    { role: 'user', content: query }
                ]
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                // Adjust this based on the actual API response structure
                return JSON.stringify(response.data);
            } else {
                return "Error: Unable to fetch results.";
            }
        } catch (error: any) {
            return `Error: ${error.message}`;
        }
    },
    {
        name: "perplexity_search",
        description: "Search the web using the Perplexity API.",
        schema: perplexitySearchSchema,
    }
);