'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProvider } from '@auth0/nextjs-auth0/client';
import { User } from '../types/User';
import { Project } from '../types/Project';
import { Artifact } from '../types/Artifact';
import { userApi } from '../utils/apiClients/User';
import { projectApi } from '../utils/apiClients/Project';
import { artifactApi } from '../utils/apiClients/Artifact';

interface AppContextType {
  user: User | null;
  projects: Project[];
  currentProject: Project | null;
  currentArtifact: Artifact | null;
  dispatchUserUpdate: (user: User | null) => void;
  dispatchProjectsUpdate: (projects: Project[]) => void;
  dispatchCurrentProjectUpdate: (project: Project | null) => void;
  dispatchCurrentArtifactUpdate: (artifact: Artifact | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [currentArtifact, setCurrentArtifact] = useState<Artifact | null>(null);
  const [loading, setLoading] = useState(true);

  // Dispatch functions
  const dispatchUserUpdate = (updatedUser: User | null) => {
    window.dispatchEvent(new CustomEvent('userUpdate', { detail: updatedUser }));
  };

  const dispatchProjectsUpdate = (updatedProjects: Project[]) => {
    window.dispatchEvent(new CustomEvent('projectsUpdate', { detail: updatedProjects }));
  };

  const dispatchCurrentProjectUpdate = (updatedProject: Project | null) => {
    window.dispatchEvent(new CustomEvent('currentProjectUpdate', { detail: updatedProject }));
  };

  const dispatchCurrentArtifactUpdate = (updatedArtifact: Artifact | null) => {
    window.dispatchEvent(new CustomEvent('currentArtifactUpdate', { detail: updatedArtifact }));
  };

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      console.log('Fetching initial data...');
      try {
        // Fetch user data (assuming we have a logged-in user's ID)
        const userData = await userApi.getUser('current-user-id');
        dispatchUserUpdate(userData);

        // Fetch projects
        const projectsData = await projectApi.getProjects();
        dispatchProjectsUpdate(projectsData);

        // Set initial current project and artifact if available
        if (projectsData.length > 0) {
          const firstProject = projectsData[0];
          dispatchCurrentProjectUpdate(firstProject);
          
          if (firstProject.artifacts && firstProject.artifacts.length > 0) {
            const firstArtifact = await artifactApi.getArtifact(firstProject.id, firstProject.artifacts[0].id);
            dispatchCurrentArtifactUpdate(firstArtifact);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Event listeners for updating context
  useEffect(() => {
    const handleUserUpdate = (event: CustomEvent<User>) => setUser(event.detail);
    const handleProjectsUpdate = (event: CustomEvent<Project[]>) => setProjects(event.detail);
    const handleCurrentProjectUpdate = (event: CustomEvent<Project>) => setCurrentProject(event.detail);
    const handleCurrentArtifactUpdate = (event: CustomEvent<Artifact>) => setCurrentArtifact(event.detail);

    window.addEventListener('userUpdate', handleUserUpdate as EventListener);
    window.addEventListener('projectsUpdate', handleProjectsUpdate as EventListener);
    window.addEventListener('currentProjectUpdate', handleCurrentProjectUpdate as EventListener);
    window.addEventListener('currentArtifactUpdate', handleCurrentArtifactUpdate as EventListener);

    return () => {
      window.removeEventListener('userUpdate', handleUserUpdate as EventListener);
      window.removeEventListener('projectsUpdate', handleProjectsUpdate as EventListener);
      window.removeEventListener('currentProjectUpdate', handleCurrentProjectUpdate as EventListener);
      window.removeEventListener('currentArtifactUpdate', handleCurrentArtifactUpdate as EventListener);
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Or a more sophisticated loading component
  }

  return (
    <UserProvider>
      <AppContext.Provider value={{ 
        user, 
        projects, 
        currentProject, 
        currentArtifact, 
        dispatchUserUpdate,
        dispatchProjectsUpdate,
        dispatchCurrentProjectUpdate,
        dispatchCurrentArtifactUpdate
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