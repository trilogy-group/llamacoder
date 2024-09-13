'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProvider } from '@auth0/nextjs-auth0/client';
import { Project } from '../types/Project';
import { projectApi } from '../utils/apiClients/Project';

interface AppContextType {
  projects: Project[];
  projectsLoading: boolean;
  projectsError: Error | null;
  dispatchProjectsUpdate: (projects: Project[]) => void;
  refreshProjects: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState<Error | null>(null);
  const [hasLoadedProjects, setHasLoadedProjects] = useState(false);

  const fetchProjects = useCallback(async () => {
    if (hasLoadedProjects) return;
    
    setProjectsLoading(true);
    setProjectsError(null);
    try {
      const projectsData = await projectApi.getProjects();
      setProjects(projectsData);
      setHasLoadedProjects(true);
    } catch (error) {
      setProjectsError(error instanceof Error ? error : new Error('Failed to fetch projects'));
    } finally {
      setProjectsLoading(false);
    }
  }, [hasLoadedProjects]);

  const refreshProjects = useCallback(async () => {
    setProjectsLoading(true);
    setProjectsError(null);
    try {
      const projectsData = await projectApi.getProjects();
      setProjects(projectsData);
    } catch (error) {
      setProjectsError(error instanceof Error ? error : new Error('Failed to refresh projects'));
    } finally {
      setProjectsLoading(false);
    }
  }, []);

  const dispatchProjectsUpdate = useCallback((updatedProjects: Project[]) => {
    setProjects(updatedProjects);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <UserProvider>
      <AppContext.Provider value={{ 
        projectsLoading,
        projectsError,
        projects, 
        dispatchProjectsUpdate,
        refreshProjects,
      }}>
        {children}
      </AppContext.Provider>
    </UserProvider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};