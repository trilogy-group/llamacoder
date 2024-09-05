export interface Message {
    id: string;
    content: string;
    role: "user" | "assistant";
}

export type Artifact = {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    prompt: string;
    code: string;
    dependencies: Record<string, string>;
    template: string;
    history: Message[];
};
