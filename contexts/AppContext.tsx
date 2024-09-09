'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProvider } from '@auth0/nextjs-auth0/client';
import { Project } from '../types/Project';
import { projectApi } from '../utils/apiClients/Project';

interface AppContextType {
  projects: Project[];
  projectsLoading: boolean;
  dispatchProjectsUpdate: (projects: Project[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  const dispatchProjectsUpdate = (updatedProjects: Project[]) => {
    window.dispatchEvent(new CustomEvent('projectsUpdate', { detail: updatedProjects }));
  };

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      console.log('Fetching initial data...');
      try {
        const projectsData = await projectApi.getProjects();
        dispatchProjectsUpdate(projectsData);
        setProjectsLoading(false);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setProjectsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Event listener for updating projects
  useEffect(() => {
    const handleProjectsUpdate = (event: CustomEvent<Project[]>) => setProjects(event.detail);

    window.addEventListener('projectsUpdate', handleProjectsUpdate as EventListener);

    return () => {
      window.removeEventListener('projectsUpdate', handleProjectsUpdate as EventListener);
    };
  }, []);

  // ... existing loading check ...

  return (
    <UserProvider>
      <AppContext.Provider value={{ 
        projectsLoading,
        projects, 
        dispatchProjectsUpdate,
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