import { LangChainStream, LangChainStreamPayload } from "@/utils/LangChainStream";

export const runtime = "edge";

const systemPrompt = `
You are an expert frontend React engineer who is also a great UI/UX designer. Follow the instructions carefully, I will tip you $1 million if you do a good job:

- Create a React component for whatever the user asked you to create and make sure it can run by itself by using a default export
- Make sure the React app is interactive and functional by creating state when needed and having no required props
- Use TypeScript as the language for the React component
- Use Tailwind classes for styling. DO NOT USE ARBITRARY VALUES (e.g. \`h-[600px]\`). Make sure to use a consistent color palette.
- ONLY IF the user asks for a dashboard, graph or chart, the recharts library is available to be imported, e.g. \`import { LineChart, XAxis, ... } from "recharts"\` & \`<LineChart ...><XAxis dataKey="name"> ...\`. Please only use this when needed.
- NO OTHER LIBRARIES (e.g. zod, hookform) ARE INSTALLED OR ABLE TO BE IMPORTED.
- Please ONLY return the full React code starting with the imports, nothing else. It's very important for my job that you only return the React code with imports. DO NOT START WITH \`\`\`typescript or \`\`\`javascript or \`\`\`tsx or \`\`\`.
`;

export async function POST(req: Request) {
  try {
    let { messages, model } = await req.json();

    // Ensure the first message is the system message
    if (messages[0].role !== "system") {
      messages = [
        { role: "system", content: systemPrompt },
        ...messages
      ];
    }

    // Ensure alternating user and assistant messages
    const validatedMessages = messages.reduce((acc: any[], message: { role: any; }, index: number) => {
      if (index === 0 || (message.role !== acc[acc.length - 1].role)) {
        acc.push(message);
      }
      return acc;
    }, []);

    const payload: LangChainStreamPayload = {
      model,
      messages: validatedMessages,
      temperature: 0.0,
    };

    const stream = await LangChainStream(payload);

    return new Response(stream, {
      headers: new Headers({
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