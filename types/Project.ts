import { Artifact } from "./Artifact";
import { FileContext } from "./FileContext";

export interface Project {
    id: string;
    title: string;
    description: string;
    thumbnail?: string;
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
