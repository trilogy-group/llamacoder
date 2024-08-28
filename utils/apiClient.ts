import { createParser, ParsedEvent, ReconnectInterval } from "eventsource-parser";

async function fetchStreamedResponse(endpoint: string, payload: any) {
    const res = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }

    return res.body;
}

async function parseStreamedResponse(stream: ReadableStream<Uint8Array>) {
    let result = "";

    const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === "event") {
            try {
                const text = JSON.parse(event.data).text ?? "";
                result += text;
            } catch (e) {
                console.error(e);
            }
        }
    };

    const reader = stream.getReader();
    const decoder = new TextDecoder();
    const parser = createParser(onParse);
    let done = false;

    while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        parser.feed(chunkValue);
    }

    return result;
}

async function fetchAndParseCode(messages: { role: string; content: string }[], model: string) {
    const stream = await fetchStreamedResponse("/api/generateCode", { messages, model });
    if (!stream) {
        throw new Error("No data received from the server");
    }
    return parseStreamedResponse(stream);
}

export const generateCode = async (
    messages: { role: string; content: string }[],
    model: string
) => {
    try {
        return await fetchAndParseCode(messages, model);
    } catch (error: any) {
        console.error("Error in generateCode:", error);
        throw error;
    }
}

export const modifyCode = async (
    messages: { role: string; content: string }[],
    model: string,
) => {
    try {
        return await fetchAndParseCode(messages, model);
    } catch (error: any) {
        console.error("Error in modifyCode:", error);
        throw error;
    }
}

export const generateFunFact = async (topic?: string) => {
    if (!topic) {
        const topics = ["developer", "react framework", "typescript", "UI/UX", "javascript"];
        topic = topics[Math.floor(Math.random() * topics.length)];
    }
    const stream = await fetchStreamedResponse("/api/funfact", { topic });
    if (!stream) {
        throw new Error("No data received from the server");
    }
    return parseStreamedResponse(stream);
}