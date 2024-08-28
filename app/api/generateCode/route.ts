import { LangChainStream, LangChainStreamPayload } from "@/utils/LangChainStream";

export const runtime = "nodejs";

const systemPrompt = `
You are an expert frontend React engineer who is also a great UI/UX designer. Follow the instructions carefully, I will tip you $1 million if you do a good job:

- Create a React component for whatever the user asked you to create and make sure it can run by itself by using a default export.
- Make sure the React app is interactive and functional by creating state when needed and having no required props.
- The component must be aesthetically pleasing and modern as to be expected from a great UI/UX designer. Use mui as the default way to make the UI beautiful.
- Use TypeScript as the language for the React component.
- If the user asks you to debug an error while running the code, only focus on fixing the issue pointed out.
- Maintain consistency in terms of the code snippets you generate. Any code you generate must be the same as the latest generated code in the chat history, with added changes as per the latest user request. DO NOT make changes that were not instructed.  
- Use Tailwind classes for styling. DO NOT USE ARBITRARY VALUES (e.g. \`h-[600px]\`). Make sure to use a consistent color palette. You do not need to import tailwindcss explicitly.
- ONLY IF the user asks for a dashboard, graph or chart, the recharts library is available to be imported, e.g. \`import { LineChart, XAxis, ... } from "recharts"\` & \`<LineChart ...><XAxis dataKey="name"> ...\`. Please only use this when needed.
- Use Axios if you need to make an API request. 
- NO OTHER LIBRARIES (e.g. zod, hookform) ARE INSTALLED OR ABLE TO BE IMPORTED.
- Within the <CODE> tag, please ONLY return the full React code starting with the imports, nothing else. It's very important for my job that you only return the React code with imports. DO NOT START WITH \`\`\`typescript or \`\`\`javascript or \`\`\`tsx or \`\`\`.
- The code you generate must be the full code, not only the latest changes requested. 

Your output must be of the following format, any response that does not adhere to the following format is considered wrong.
First think about the following in <THOUGHTS> tags.
<THOUGHTS>
  ## Are the latest changes requested by the user a functionality change, UI change, error fix or something else?
  ## Does the code need an overhaul or some updates to the previously generated code?
  ## What is the best approach for the latest changes requested by the user?
  ## How do I ensure that the new code generated based off of my previously generated code?
  ## How do I make this work without any libraries OTHER THAN mui/material, lucide-react, react-dom, recharts, axios, react-router-dom?  
</THOUGHTS>
<CODE>
  //Your code goes here
</CODE>

First put your thoughts within the <THOUGHTS> tag and then start coding in the <CODE> tags. Remember, having the <CODE> and </CODE> tags in your response is mandatory. Good luck!
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

    const fileContentMessages = messages.filter((m: { content: string }) => m.content.startsWith("File content:"));
    if (fileContentMessages.length > 0) {
      const fileContents = fileContentMessages.map((m: { content: string }) => m.content.replace("File content: ", ""));
      messages = messages.filter((m: { role: string; content: string }) => !fileContentMessages.includes(m));
      messages.push({ role: "user", content: `Here are the contents of the uploaded files:\n\n${fileContents.join("\n\n")}\n\nPlease use this content to inform your response.` });
      console.log("File contents added to messages:", fileContents.map((content: string) => content.substring(0, 100) + "...").join("\n"));
    }

    const combinedMessages = messages.reduce((acc: any[], message: any) => {
      if (acc.length > 0 && acc[acc.length - 1].role === message.role) {
        acc[acc.length - 1].content += "\n\n" + message.content;
      } else {
        acc.push({ ...message });
      }
      return acc;
    }, [] as { role: string; content: string }[]);

    const payload: LangChainStreamPayload = {
      model,
      messages: combinedMessages,
      temperature: 0.0,
    };

    const stream = await LangChainStream(payload);

    // Capture the stream and store it in a variable
    const reader = stream.getReader();
    let result = '';
    let done = false;
    const decoder = new TextDecoder();
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      if (value) {
        const decodedValue = decoder.decode(value, { stream: true });
        const lines = decodedValue.split('\n');
        for (const line of lines) {
          if (line.trim().startsWith('data:')) {
            const json = line.replace('data: ', '');
            try {
              const parsed = JSON.parse(json);
              if (parsed.text) {
                result += parsed.text;
              }
            } catch (e) {
              console.error('Failed to parse JSON:', json);
            }
          }
        }
      }
    }

    // Print the captured stream
    // console.log("Captured stream:", result);

    // Create a ReadableStream to stream the response
    const streamResponse = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        const codeMatch = result.match(/<CODE>([\s\S]*?)<\/CODE>/);
        const code = codeMatch ? codeMatch[1] : "No code found";
        const jsonResponse = JSON.stringify({ text: code });
        controller.enqueue(encoder.encode("data: " + jsonResponse + "\n\n"));
        controller.close();
      }
    });

    return new Response(streamResponse, {
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