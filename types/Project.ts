import { FileContext } from "./FileContext";

export interface Project {
    id: string;
    title: string;
    description: string;
    thumbnail?: string;
    context?: FileContext[];
    entrypoint?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    createdBy?: string | null | undefined;
    updatedBy?: string | null | undefined;
    publishedUrl?: string;
}
