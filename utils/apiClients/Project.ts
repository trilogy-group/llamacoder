import { Project, AccessLevel } from '@/types/Project';

export const projectApi = {
    getProjects: async (): Promise<Project[]> => {
        const response = await fetch('/api/projects');
        if (!response.ok) {
            throw new Error('Failed to fetch projects');
        }
        return response.json();
    },

    getProject: async (id: string): Promise<Project> => {
        const response = await fetch(`/api/projects/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch project');
        }
        return response.json();
    },

    createProject: async (projectData: Partial<Project>): Promise<Project> => {
        const response = await fetch('/api/projects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(projectData),
        });
        if (!response.ok) {
            throw new Error('Failed to create project');
        }
        return response.json();
    },

    updateProject: async (id: string, projectData: Partial<Project>): Promise<Project> => {
        const response = await fetch(`/api/projects/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...projectData }),
        });
        if (!response.ok) {
            throw new Error('Failed to update project');
        }
        return response.json();
    },

    deleteProject: async (id: string): Promise<void> => {
        const response = await fetch(`/api/projects/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Failed to delete project');
        }
    },

    fetchContributors: async (projectId: string): Promise<any[]> => {
        const response = await fetch(`/api/projects/${projectId}/contributors`);
        if (!response.ok) {
            throw new Error('Failed to fetch contributors');
        }
        return response.json();
    },

    shareProject: async (projectId: string, email: string, accessLevel: AccessLevel | 'revoke'): Promise<{ success: boolean, message: string }> => {
        const response = await fetch(`/api/projects/${projectId}/share`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, accessLevel }),
        });
        if (!response.ok) {
            throw new Error('Failed to share project');
        }
        return response.json();
    },
};