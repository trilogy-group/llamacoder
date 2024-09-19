'use client'

import { UserProvider, useUser } from '@auth0/nextjs-auth0/client'
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { Project } from '../types/Project'
import { projectApi } from '../utils/apiClients/Project'
import { userApi } from '../utils/apiClients/User'

interface AppContextType {
	projects: Project[]
	projectsLoading: boolean
	projectsError: Error | null
	dispatchProjectsUpdate: (projects: Project[]) => void
	refreshProjects: () => Promise<void>
	fetchContributors: () => Promise<void> // Add this new property
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	return (
		<UserProvider>
			<AppContextProvider>{children}</AppContextProvider>
		</UserProvider>
	)
}

const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { user, isLoading: isUserLoading } = useUser()
	const [projects, setProjects] = useState<Project[]>([])
	const [projectsLoading, setProjectsLoading] = useState(true)
	const [projectsError, setProjectsError] = useState<Error | null>(null)
	const [hasAlreadyFetchedProjects, setHasAlreadyFetchedProjects] = useState(false)
	const [isContributorsBeingFetched, setIsContributorsBeingFetched] = useState(false)

	const fetchProjects = useCallback(async () => {
		if (isUserLoading) return
		if (hasAlreadyFetchedProjects) return
		setProjectsLoading(true)
		setProjectsError(null)
		try {
			const projectsData = await projectApi.getProjects()
			setProjects(projectsData)
			setHasAlreadyFetchedProjects(true)
		} catch (error) {
			setProjectsError(error instanceof Error ? error : new Error('Failed to fetch projects'))
		} finally {
			setProjectsLoading(false)
		}
	}, [isUserLoading, hasAlreadyFetchedProjects])

	const fetchContributors = useCallback(async () => {
		if (isUserLoading) return
		if (isContributorsBeingFetched) return
		setIsContributorsBeingFetched(true)
		for (const project of projects) {
			if (project.contributors !== undefined) {
				continue
			}
			try {
				const contributors = await projectApi.fetchContributors(project.id)
				setProjects((prevProjects) => prevProjects.map((p) => (p.id === project.id ? { ...p, contributors: contributors } : p)))
			} catch (error) {
				console.error(`Failed to fetch contributors for project ${project.id}:`, error)
			}
		}
		setIsContributorsBeingFetched(false)
	}, [projects])

	const refreshProjects = useCallback(async () => {
		setProjectsLoading(true)
		setProjectsError(null)
		try {
			const projectsData = await projectApi.getProjects()
			setProjects(projectsData)
		} catch (error) {
			setProjectsError(error instanceof Error ? error : new Error('Failed to refresh projects'))
		} finally {
			setProjectsLoading(false)
		}
	}, [])

	const dispatchProjectsUpdate = useCallback((updatedProjects: Project[]) => {
		setProjects(updatedProjects)
	}, [])

	const addUserToFGA = useCallback(async (email: string, name?: string) => {
		try {
			await userApi.addUser({ email, name })
		} catch (error) {
			console.error('Error adding user to FGA:', error)
		}
	}, [])

	useEffect(() => {
		fetchProjects()
	}, [fetchProjects])

	useEffect(() => {
		if (projects.length > 0) {
			fetchContributors()
		}
	}, [projects, fetchContributors])

	useEffect(() => {
		const addUserToFGAIfFirstLogin = async () => {
			if (user && !isUserLoading) {
				const isFirstLogin = localStorage.getItem(`fga_user_${user.email}`) !== 'true'
				if (isFirstLogin && user.email) {
					try {
						await addUserToFGA(user.email, user.name || undefined)
						localStorage.setItem(`fga_user_${user.email}`, 'true')
					} catch (error) {
						console.error('Failed to add user to FGA:', error)
					}
				}
			}
		}

		addUserToFGAIfFirstLogin()
	}, [user, isUserLoading, addUserToFGA])

	return (
		<AppContext.Provider
			value={{
				projectsLoading,
				projectsError,
				projects,
				dispatchProjectsUpdate,
				refreshProjects,
				fetchContributors, // Add this new property
			}}
		>
			{children}
		</AppContext.Provider>
	)
}

export const useAppContext = () => {
	const context = useContext(AppContext)
	if (context === undefined) {
		throw new Error('useAppContext must be used within an AppProvider')
	}
	return context
}
