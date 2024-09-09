import apiClient from './apiClient';
import { Artifact } from '@/types/Artifact';

export const artifactApi = {
  getArtifacts: async (projectId: string): Promise<Artifact[]> => {
    const response = await apiClient.get(`/projects/${projectId}/artifacts`);
    return response.data;
  },
  
  getArtifact: async (projectId: string, artifactId: string): Promise<Artifact> => {
    const response = await apiClient.get(`/projects/${projectId}/artifacts/${artifactId}`);
    return response.data;
  },
  
  createArtifact: async (projectId: string, artifactData: Partial<Artifact>): Promise<Artifact> => {
    const response = await apiClient.post(`/projects/${projectId}/artifacts`, artifactData);
    return response.data;
  },
  
  updateArtifact: async (projectId: string, artifactId: string, artifactData: Partial<Artifact>): Promise<Artifact> => {
    const response = await apiClient.put(`/projects/${projectId}/artifacts/${artifactId}`, artifactData);
    return response.data;
  },
  
  deleteArtifact: async (projectId: string, artifactId: string): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/artifacts/${artifactId}`);
  },
};