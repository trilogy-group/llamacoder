import { Artifact } from "./Artifact";
import { Attachment } from "./Attachment";

export interface Project {
    id: string;
    title: string;
    description: string;
    thumbnail?: string;
    context: Attachment[];
    artifacts: Artifact[];
    entrypoint: Artifact;
    status: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
    publishedUrl: string;
}
