import { Attachment } from "./Attachment";

export interface Message {
    id: string;
    text: string;
    role: "user" | "assistant";
    attachments?: Attachment[];
}
