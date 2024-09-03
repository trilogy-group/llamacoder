import { Artifact } from "./Artifact";

export type FileContext = {
    id: string;
    title: string;
    description: string;
    mimeType: string;
    path: string;
};

export type Project = {
    id: string;
    title: string;
    description: string;
    thumbnail?: string;
    context: FileContext[];
    artifacts: Artifact[];
    entrypoint: Artifact;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    publishedUrl: string;
};
