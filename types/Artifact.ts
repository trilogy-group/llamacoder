import { ChatSession } from "./ChatSession";

export type Dependency = {
    name: string;
    version: string;
};

export type Artifact = {
    id: string;
    name: string;
    prompt: string;
    code: string;
    dependencies: Dependency[];
    chatSessions: ChatSession;
    createdAt: Date;
    updatedAt: Date;
};
