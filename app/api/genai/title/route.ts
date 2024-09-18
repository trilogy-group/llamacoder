import { NextResponse } from 'next/server';
import { BedrockChat } from "@langchain/community/chat_models/bedrock";

/**
 * @swagger
 * /api/genai/title:
 *   post:
 *     summary: Generate a creative project title
 *     description: Generates a catchy title for a new software project based on a given description
 *     tags:
 *       - GenAI
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 description: A brief description of the software project
 *     responses:
 *       200:
 *         description: Successfully generated project title
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   description: The generated project title
 *       500:
 *         description: Failed to generate project title
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
export async function POST(request: Request) {
  try {
    const { description } = await request.json();

    const bedrock = new BedrockChat({
      model: "anthropic.claude-3-5-sonnet-20240620-v1:0",
      temperature: 0.7,
      region: "us-east-1",
      maxTokens: 50,
    });

    const prompt = `Generate a creative and catchy title for a new software project based on this description: "${description}". The title should be short, memorable, and not more than 5 words. Only return the title of the project, without any other accompanying text`;

    const response = await bedrock.invoke(prompt);
    const title = response.content.toString().trim();

    return NextResponse.json({ title });
  } catch (error) {
    console.error('Error generating project title:', error);
    return NextResponse.json({ error: 'Failed to generate project title' }, { status: 500 });
  }
}
