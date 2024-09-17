import { Artifact } from '@/types/Artifact';

export const artifactApi = {
  getArtifacts: async (projectId: string): Promise<Artifact[]> => {
    const response = await fetch(`/api/projects/${projectId}/artifacts`);
    if (!response.ok) {
      throw new Error('Failed to fetch artifacts');
    }
    return response.json();
  },
  
  getArtifact: async (projectId: string, artifactId: string): Promise<Artifact> => {
    const response = await fetch(`/api/projects/${projectId}/artifacts/${artifactId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch artifact');
    }
    return response.json();
  },
  
  createArtifact: async (projectId: string, artifactData: Partial<Artifact>): Promise<Artifact> => {
    const response = await fetch(`/api/projects/${projectId}/artifacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(artifactData),
    });
    if (!response.ok) {
      throw new Error('Failed to create artifact');
    }
    return response.json();
  },
  
  updateArtifact: async (projectId: string, artifactId: string, artifactData: Partial<Artifact>): Promise<Artifact> => {
    const response = await fetch(`/api/projects/${projectId}/artifacts/${artifactId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(artifactData),
    });
    if (!response.ok) {
      throw new Error('Failed to update artifact');
    }
    return response.json();
  },
  
  deleteArtifact: async (projectId: string, artifactId: string): Promise<void> => {
    const response = await fetch(`/api/projects/${projectId}/artifacts/${artifactId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete artifact');
    }
  },
  
  publish: async (artifact: Artifact): Promise<{ success: boolean; url?: string }> => {
    const response = await fetch('/api/publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(artifact),
    });
    if (!response.ok) {
      throw new Error('Failed to publish artifact');
    }
    return response.json();
  },
};