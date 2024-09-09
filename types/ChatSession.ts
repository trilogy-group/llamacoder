import { Message } from "./Message";
import { Attachment } from "./Attachment";

export interface ChatSession {
    id: string;
    artifactId: string;
    messages: Message[];
    attachments: Attachment[];
    createdAt: string;
    updatedAt: string;
    user: string;
    model: string;
}