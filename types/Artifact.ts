export type Artifact = {
    id: string;
    created_at: Date;
    updated_at: Date;
    name: string;
    prompt: string;
    code: string;
    dependencies: Record<string, string>;
    template: string;
};
