import { ChatSession } from "./ChatSession";

export type Dependency = {
    name: string;
    version: string;
};

export type Artifact = {
    id: string;
    description: string;
    projectId: string;
    status: "idle" | "creating" | "updating";
    name?: string;
    code?: string;
    dependencies?: Dependency[];
    chatSessions?: ChatSession[];
    createdAt?: string;
    updatedAt?: string;
};
