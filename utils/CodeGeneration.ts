import { createParser, ParsedEvent, ReconnectInterval } from "eventsource-parser";
import { toast } from "sonner";

export const generateCode = async (
    messages: { role: string; content: string }[],
    model: string,
    setGeneratedCode: (code: string) => void,
) => {
    console.log("Messages:", JSON.stringify(messages));
    console.log("Model:", model);
    console.log("Messages length:", messages.length);
    try {
        const chatRes = await fetch("/api/generateCode", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messages,
                model,
            }),
        });

        if (!chatRes.ok) {
            throw new Error(`HTTP error! status: ${chatRes.status}`);
        }

        const data = chatRes.body;
        if (!data) {
            throw new Error("No data received from the server");
        }

        let newGeneratedCode = "";

        const onParse = (event: ParsedEvent | ReconnectInterval) => {
            if (event.type === "event") {
                const data = event.data;
                try {
                    const text = JSON.parse(data).text ?? "";
                    newGeneratedCode += text;
                    setGeneratedCode(newGeneratedCode);
                } catch (e) {
                    console.error(e);
                }
            }
        };

        const reader = data.getReader();
        const decoder = new TextDecoder();
        const parser = createParser(onParse);
        let done = false;

        while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
            const chunkValue = decoder.decode(value);
            parser.feed(chunkValue);
        }

        return newGeneratedCode;
    } catch (error: any) {
        console.error("Error in generateCode:", error);
        throw error;
    }
}

export const modifyCode = async (
    messages: { role: string; content: string }[],
    model: string,
    setGeneratedCode: (code: string) => void,
) => {
    try {
        const chatRes = await fetch("/api/generateCode", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messages,
                model,
            }),
        });

        if (!chatRes.ok) {
            throw new Error(`HTTP error! status: ${chatRes.status}`);
        }

        const data = chatRes.body;
        if (!data) {
            throw new Error("No data received from the server");
        }

        let newGeneratedCode = "";

        const onParse = (event: ParsedEvent | ReconnectInterval) => {
            if (event.type === "event") {
                const data = event.data;
                try {
                    const text = JSON.parse(data).text ?? "";
                    newGeneratedCode += text;
                    setGeneratedCode(newGeneratedCode);
                } catch (e) {
                    console.error(e);
                }
            }
        };

        const reader = data.getReader();
        const decoder = new TextDecoder();
        const parser = createParser(onParse);
        let done = false;

        while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
            const chunkValue = decoder.decode(value);
            parser.feed(chunkValue);
        }

        return newGeneratedCode;
    } catch (error: any) {
        console.error("Error in modifyCode:", error);
        toast.error("An error occurred while modifying code");
        throw error;
    }
}