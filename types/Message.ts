import { Attachment } from "./Attachment";

export interface Message {
    role: "user" | "assistant";
    text: string;
    attachments?: Attachment[];
}
