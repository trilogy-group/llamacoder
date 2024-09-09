import { Artifact } from "./Artifact";
import { Attachment } from "./Attachment";

export type Project = {
    id: string;
    title: string;
    description: string;
    thumbnail?: string;
    attachments: Attachment[];
    artifacts: Artifact[];
    entrypoint: Artifact;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    publishedUrl: string;
};
