import { LangChainStream, LangChainStreamPayload } from "@/utils/LangChainStream";

export const runtime = "nodejs";

const systemPrompt = `
You are tasked with generating witty and entertaining fun facts about a given topic.

Guidelines for generating witty fun facts:
- Keep the fact surprising, unusual, or counterintuitive
- Use wordplay, puns, or clever connections when possible
- Ensure the fact is true and verifiable
- Make it engaging and memorable
- Include 1-3 relevant emojis in your fun fact. One emoji at the beginning and one at the end is mandatory.
- A fun fact should not be more than 1 sentence.

Include your fun fact within <fun_fact> tags.
`;

export async function POST(req: Request) {
  try {
    let { topic } = await req.json();

    const payload: LangChainStreamPayload = {
      model: "claude-3-5-sonnet-20240620",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `<topic>${topic}</topic>`},
      ],
      temperature: 1,
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

    // Create a ReadableStream to stream the response
    const streamResponse = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        const funFactMatch = result.match(/<fun_fact>([\s\S]*?)<\/fun_fact>/);
        const funFact = funFactMatch ? funFactMatch[1] : "Developers often name variables after food they're craving 🍕💻🍔";
        const jsonResponse = JSON.stringify({ text: funFact });
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
    console.error("Error in POST /api/funfact:", error);
    return new Response(JSON.stringify({ error: "An error occurred while processing your request" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}