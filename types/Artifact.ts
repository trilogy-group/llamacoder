import { ChatSession } from "./ChatSession";
import { SandpackError } from "@codesandbox/sandpack-client";

export type Dependency = {
    name: string;
    version: string;
};

export type ArtifactStatus = "idle" | "creating" | "updating" | "fixing" | "running" | "error" | "success";

export type Artifact = {
    id: string;
    description: string;
    projectId: string;
    status: ArtifactStatus;
    name?: string;
    code?: string;
    dependencies?: Dependency[];
    chatSession?: ChatSession | null;
    createdAt?: string;
    updatedAt?: string;
    error?: SandpackError | null;
};
