async function fetchResponse(endpoint: string, method: "GET" | "POST" = "POST", payload?: any) {
    const options: RequestInit = {
        method,
        headers: {
            "Content-Type": "application/json",
        },
    };

    if (method === "POST" && payload) {
        options.body = JSON.stringify(payload);
    }

    const res = await fetch(endpoint, options);

    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }

    return res.json();
}

async function fetchAndParseCode(messages: { role: string; content: any[] }[], model: string) {
    return fetchResponse("/api/generateCode", "POST", { messages, model });
}

export const generateCode = async (
    messages: { role: string; content: any[] }[],
    model: string
): Promise<{ code: string; extraLibraries: { name: string; version: string }[] }> => {
    try {
        return await fetchAndParseCode(messages, model);
    } catch (error: any) {
        console.error("Error in generateCode:", error);
        throw error;
    }
}

export const modifyCode = async (
    messages: { role: string; content: any[] }[],
    model: string,
): Promise<{ code: string; extraLibraries: { name: string; version: string }[] }> => {
    try {
        return await fetchAndParseCode(messages, model);
    } catch (error: any) {
        console.error("Error in modifyCode:", error);
        throw error;
    }
}

export const getApiSpec = async (): Promise<any> => {
    try {
        return await fetchResponse("/api/docs", "GET");
    } catch (error: any) {
        console.error("Error in getApiSpec:", error);
        throw error;
    }
}

