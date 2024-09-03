export type Artifact = {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    prompt: string;
    code: string;
    dependencies: Record<string, string>;
    template: string;
};
