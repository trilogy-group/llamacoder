import { Artifact } from "./Artifact";

export type FileContext = {
    id: string;
    title: string;
    description: string;
    mimeType: string;
    path: string;
};

export interface Project {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    context: FileContext[];
    artifacts: Artifact[];
    entrypoint: Artifact;
    status: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
    publishedUrl: string;
}
