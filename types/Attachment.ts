export interface Attachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}