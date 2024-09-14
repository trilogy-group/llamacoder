import { FileContext } from "./FileContext";
import { Artifact } from "./Artifact";

export type AccessLevel = 'owner' | 'editor' | 'viewer';

export interface Contributor {
    email: string;
    accessLevel: AccessLevel;
}

export interface Project {
    id: string;
    title: string;
    description: string;
    thumbnail?: string;
    context?: FileContext[];
    artifacts?: Artifact[];
    entrypoint?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    createdBy?: string | null | undefined;
    updatedBy?: string | null | undefined;
    publishedUrl?: string;
    accessLevel?: AccessLevel;
    contributors?: Contributor[];
}
