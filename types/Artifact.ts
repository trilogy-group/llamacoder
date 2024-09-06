export interface Message {
    id: string;
    content: string;
    role: "user" | "assistant";
    attachments?: File[];
}

export type Artifact = {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    prompt: string;
    code: string;
    dependencies: Record<string, string>;
    history: Message[];
};
