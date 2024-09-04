import { Artifact } from "./Artifact";
import { FileContext } from "./FileContext";

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
 