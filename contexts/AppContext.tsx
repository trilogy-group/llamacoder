'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProvider, useUser } from '@auth0/nextjs-auth0/client';
import { Project } from '../types/Project';
import { projectApi } from '../utils/apiClients/Project';

interface AppContextType {
  projects: Project[];
  projectsLoading: boolean;
  projectsError: Error | null;
  dispatchProjectsUpdate: (projects: Project[]) => void;
  refreshProjects: () => Promise<void>;
  fetchContributors: () => Promise<void>; // Add this new property
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <UserProvider>
      <AppContextProvider>{children}</AppContextProvider>
    </UserProvider>
  );
};

const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading: isUserLoading } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState<Error | null>(null);
  const [hasAlreadyFetchedProjects, setHasAlreadyFetchedProjects] = useState(false);
  const [isContributorsBeingFetched, setIsContributorsBeingFetched] = useState(false);

  const fetchProjects = useCallback(async () => {
    if (isUserLoading) return;
    if (hasAlreadyFetchedProjects) return;
    setProjectsLoading(true);
    setProjectsError(null);
    try {
      const projectsData = await projectApi.getProjects();
      setProjects(projectsData);
      setHasAlreadyFetchedProjects(true);
    } catch (error) {
      setProjectsError(error instanceof Error ? error : new Error('Failed to fetch projects'));
    } finally {
      setProjectsLoading(false);
    }
  }, [user, isUserLoading, hasAlreadyFetchedProjects]);

  const fetchContributors = useCallback(async () => {
    if (isUserLoading) return;
    if (isContributorsBeingFetched) return;
    setIsContributorsBeingFetched(true);
    for (const project of projects) {
      if (project.contributors !== undefined) {
        continue;
      }
      try {
        const contributors = await projectApi.fetchContributors(project.id);
        setProjects(prevProjects => 
          prevProjects.map(p => 
            p.id === project.id ? { ...p, contributors: contributors } : p
          )
        );
      } catch (error) {
        console.error(`Failed to fetch contributors for project ${project.id}:`, error);
      }
    }
    setIsContributorsBeingFetched(false);
  }, [projects]);

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

  useEffect(() => {
    if (projects.length > 0) {
      fetchContributors();
    }
  }, [projects, fetchContributors]);

  return (
    <AppContext.Provider value={{ 
      projectsLoading,
      projectsError,
      projects, 
      dispatchProjectsUpdate,
      refreshProjects,
      fetchContributors, // Add this new property
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};