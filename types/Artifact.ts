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
    projectId: string;
    dependencies: Dependency[];
    chatSessions: ChatSession;
    createdAt: string;
    updatedAt: string;
};
