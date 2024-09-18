'use client'

import Alert from '@/components/Alert'
import ConfirmationDialog from '@/components/ConfirmationDialog'
import CreateProjectButton from '@/components/CreateProjectButton'
import EmptyProjectMessage from '@/components/EmptyProjectMessage'
import HeaderV2 from '@/components/HeaderV2'
import ProjectList from '@/components/ProjectList'
import ProjectOverviewInputForm from '@/components/ProjectOverviewInputForm'
import ProjectShareModal from '@/components/ProjectShareModal'
import { useAppContext } from '@/contexts/AppContext'
import { AccessLevel, Project } from '@/types/Project'
import { projectApi } from '@/utils/apiClients/Project'
import { useUser } from '@auth0/nextjs-auth0/client'
import { CircularProgress } from '@mui/material'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

const Dashboard: React.FC = () => {
	const { user, error: userError, isLoading: userLoading } = useUser()
	const { projects, projectsLoading, projectsError, refreshProjects } = useAppContext()
	const [showCreateForm, setShowCreateForm] = useState(false)
	const [isCreatingProject, setIsCreatingProject] = useState(false)
	const [showShareModal, setShowShareModal] = useState(false)
	const [selectedProject, setSelectedProject] = useState<Project | null>(null)
	const [alert, setAlert] = useState<{
		type: 'error' | 'info' | 'warning' | 'success'
		message: string
	} | null>(null)
	const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
	const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)

	const router = useRouter()

	// useEffect(() => {
	//   if (!projectsLoading && !projectsError) {
	//     refreshProjects();
	//   }
	// }, [projectsLoading, projectsError, projects.length, refreshProjects]);

	const handleCreateProject = async (description: string) => {
		setIsCreatingProject(true)
		try {
			const titleResponse = await axios.post('/api/generateProjectTitle', {
				description,
			})
			const generatedTitle = titleResponse.data.title

			const newProject: Partial<Project> = {
				title: generatedTitle,
				description: description,
				thumbnail: '',
				context: [],
				status: 'Inactive',
			}

			const createdProject = await projectApi.createProject(newProject)
			await refreshProjects()
			setShowCreateForm(false)
			router.push(`/workspaces/${createdProject.id}`)
		} catch (error) {
			console.error('Error creating project:', error)
			setAlert({
				type: 'error',
				message: 'Failed to create project. Please try again.',
			})
		} finally {
			setIsCreatingProject(false)
		}
	}

	const handleShareClick = (project: Project): void => {
		setSelectedProject(project)
		setShowShareModal(true)
	}

	const handleProjectDeleted = async (deletedProject: Project): Promise<void> => {
		try {
			await projectApi.deleteProject(deletedProject.id)
			setAlert({ type: 'success', message: 'Project deleted successfully.' })
			await refreshProjects()
		} catch (error) {
			console.error('Error deleting project:', error)
			setAlert({
				type: 'error',
				message: 'Failed to delete project. Please try again.',
			})
		}
	}

	const handleDeleteClick = (project: Project): void => {
		setProjectToDelete(project)
		setShowDeleteConfirmation(true)
	}

	const handleDeleteConfirm = async () => {
		if (projectToDelete) {
			await handleProjectDeleted(projectToDelete)
			setShowDeleteConfirmation(false)
			setProjectToDelete(null)
		}
	}

	const handleDeleteCancel = () => {
		setShowDeleteConfirmation(false)
		setProjectToDelete(null)
	}

	const handleUpdateAccessLevel = async (email: string, accessLevel: AccessLevel | 'revoke') => {
		console.log('Adding contributor:', email, accessLevel)
		if (!selectedProject) {
			setAlert({
				type: 'error',
				message: 'Failed to add contributor. Please try again.',
			})
			return
		}
		const { success } = await projectApi.shareProject(selectedProject?.id, email, accessLevel)
		if (!success) {
			setAlert({
				type: 'error',
				message: 'Failed to add contributor. Please try again.',
			})
			return
		}
		if (accessLevel === 'revoke') {
			setSelectedProject((prevProject) => {
				if (!prevProject) return null
				return {
					...prevProject,
					contributors: prevProject?.contributors?.filter((contributor) => contributor.email !== email),
				}
			})
		} else {
			setSelectedProject((prevProject) => {
				if (!prevProject) return null
				return {
					...prevProject,
					contributors: prevProject?.contributors?.map((contributor) =>
						contributor.email === email ? { ...contributor, accessLevel } : contributor
					),
				}
			})
		}
	}

	const handleAddContributor = async (email: string, accessLevel: AccessLevel | 'revoke') => {
		console.log('Adding contributor:', email, accessLevel)
		if (!selectedProject) {
			setAlert({
				type: 'error',
				message: 'Failed to add contributor. Please try again.',
			})
			return
		}
		const { success } = await projectApi.shareProject(selectedProject?.id, email, accessLevel)
		if (!success) {
			setAlert({
				type: 'error',
				message: 'Failed to add contributor. Please try again.',
			})
			return
		}
		if (accessLevel === 'revoke') {
			return
		} else {
			setSelectedProject((prevProject) => {
				if (!prevProject) return null
				return {
					...prevProject,
					contributors: [...(prevProject.contributors || []), { email, accessLevel }],
				}
			})
		}
	}

	if (userLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<CircularProgress size={60} />
			</div>
		)
	}

	if (projectsLoading) {
		return (
			<div className="flex h-screen flex-col items-center justify-center bg-gray-50">
				<CircularProgress size={64} />
				<h2 className="mb-2 mt-4 text-2xl font-semibold text-gray-700">Loading your projects...</h2>
			</div>
		)
	}

	if (userError) {
		router.push('/api/auth/login')
	}

	return (
		<div className="flex min-h-screen flex-col">
			<HeaderV2 user={user} />
			<main className="mt-24 w-full flex-1">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					{projects.length > 0 ? (
						<>
							<div className="mb-8 mt-8 flex items-center justify-between">
								<h2 className="text-4xl font-bold text-gray-800">Your Projects</h2>
								<CreateProjectButton onClick={() => setShowCreateForm(true)} showSearch={projects.length > 0} />
							</div>
							<ProjectList
								projects={projects}
								onProjectDeleted={handleProjectDeleted}
								onShareClick={handleShareClick}
								onDeleteClick={handleDeleteClick}
							/>
						</>
					) : (
						<EmptyProjectMessage onCreateProject={() => setShowCreateForm(true)} />
					)}
				</div>
			</main>

			{showCreateForm && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4 backdrop-blur-[2px]">
					{isCreatingProject ? (
						<div className="flex flex-col items-center justify-center bg-gray-50 p-10">
							<CircularProgress size={64} />
							<h2 className="mb-4 ml-10 mr-10 mt-6 text-2xl font-semibold text-gray-700">Creating your project...</h2>
						</div>
					) : (
						<ProjectOverviewInputForm onCancel={() => setShowCreateForm(false)} onNext={handleCreateProject} />
					)}
				</div>
			)}
			{alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
			{showShareModal && selectedProject && (
				<ProjectShareModal
					isOpen={showShareModal}
					onClose={() => setShowShareModal(false)}
					project={selectedProject}
					onUpdateAccessLevel={handleUpdateAccessLevel}
					onAddContributor={handleAddContributor}
				/>
			)}
			{showDeleteConfirmation && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
					<ConfirmationDialog
						message={<p>Are you sure you want to delete this project? This action cannot be undone.</p>}
						onConfirm={handleDeleteConfirm}
						onCancel={handleDeleteCancel}
					/>
				</div>
			)}
		</div>
	)
}

export default Dashboard
