import { ChatSession } from "./ChatSession";

export type Dependency = {
    name: string;
    version: string;
};

export type Artifact = {
    id: string;
    description: string;
    projectId: string;
    name?: string;
    code?: string;
    dependencies?: Dependency[];
    chatSessions?: ChatSession[];
    createdAt?: string;
    updatedAt?: string;
};
