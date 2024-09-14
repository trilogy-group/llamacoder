'use client'

import Alert from '@/components/Alert'
import ArtifactInfoCard from '@/components/ArtifactInfoCard'
import ArtifactList from '@/components/ArtifactLIst'
import ArtifactOverviewInputForm from '@/components/ArtifactOverviewInputForm'
import CodeViewer from '@/components/CodeViewer'
import ConfirmationDialog from '@/components/ConfirmationDialog'
import EmptyArtifactsMessage from '@/components/EmptyArtifactsMessage'
import Preview from '@/components/Preview'
import ProjectHeader from '@/components/ProjectHeader'
import ProjectShareModal from '@/components/ProjectShareModal'
import RenameDialog from '@/components/RenameDialog'
import UpdateArtifact from '@/components/UpdateArtifact'
import { Artifact } from '@/types/Artifact'
import { Attachment } from '@/types/Attachment'
import { ChatSession } from '@/types/ChatSession'
import { Message } from '@/types/Message'
import { Project, AccessLevel } from '@/types/Project'
import { artifactApi } from '@/utils/apiClients/Artifact'
import { genAiApi, parseResponse } from '@/utils/apiClients/GenAI'
import { projectApi } from '@/utils/apiClients/Project'
import { defaultDependencies, defaultCode } from '@/utils/config'
import { SandpackError } from '@codesandbox/sandpack-client'
import { CircularProgress } from '@mui/material'
import { useRouter } from 'next/navigation'
import React, { memo, useCallback, useEffect, useState, useRef } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'
import { useUser } from '@auth0/nextjs-auth0/client'
import { useAppContext } from '@/contexts/AppContext'

interface WorkspaceProps {
	projectId: string
}

const WorkspaceComponent: React.FC<WorkspaceProps> = ({ projectId }) => {
	const { user } = useUser()
	const [project, setProject] = useState<Project | null>(null)
	const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null)
	const [isArtifactListCollapsed, setIsArtifactListCollapsed] = useState(false)
	const [isUpdateArtifactCollapsed, setIsUpdateArtifactCollapsed] = useState(false)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)
	const [showCreateForm, setShowCreateForm] = useState(false)
	const [streamingMessage, setStreamingMessage] = useState<Message | null>(null)
	const [mode, setMode] = useState<'preview' | 'editor'>('preview')
	const [showShareModal, setShowShareModal] = useState(false)
	const [showDeleteArtifactConfirmation, setShowDeleteArtifactConfirmation] = useState(false)
	const [artifactToDelete, setArtifactToDelete] = useState<Artifact | null>(null)
	const [hoveredArtifact, setHoveredArtifact] = useState<Artifact | null>(null)
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
	const [alert, setAlert] = useState<{
		type: 'error' | 'info' | 'warning' | 'success'
		message: string
	} | null>(null)
	const [showRenameModal, setShowRenameModal] = useState(false)
	const [artifactToRename, setArtifactToRename] = useState<Artifact | null>(null)
	const [newArtifactName, setNewArtifactName] = useState('')

	const router = useRouter()

	// Create a new function to update both project and selectedArtifact
	const updateProjectAndArtifact = useCallback(
		(projectUpdater: (prev: Project | null) => Project | null, newSelectedArtifact: Artifact | null) => {
			setProject(projectUpdater)
			setSelectedArtifact(newSelectedArtifact)
		},
		[]
	)

	useEffect(() => {
		const fetchProjectAndArtifacts = async () => {
			setIsLoading(true)
			try {
				if (!projectId) {
					throw new Error('Project ID is undefined')
				}
				console.log('Fetching project with ID:', projectId)
				const project = await projectApi.getProject(projectId)
				console.log('Fetched project:', project)
				const artifacts = await artifactApi.getArtifacts(projectId)
				console.log('Fetched artifacts:', artifacts)

				// Update artifacts to ensure each message in the chat session has attachments set to an empty array
				const updatedArtifacts = artifacts.map((artifact) => ({
					...artifact,
					chatSession: artifact.chatSession
						? {
								...artifact.chatSession,
								messages: artifact.chatSession.messages.map((message) => ({
									...message,
									attachments: [] as Attachment[],
								})),
							}
						: null,
				}))

				updateProjectAndArtifact(
					(prevProject) => ({
						...project,
						artifacts: updatedArtifacts,
					}),
					updatedArtifacts.length > 0 ? updatedArtifacts[0] : null
				)
			} catch (err) {
				console.error('Error fetching project and artifacts:', err)
				setError('Failed to fetch project and artifacts')
			} finally {
				setIsLoading(false)
			}
		}
		fetchProjectAndArtifacts()
	}, [projectId])

	const onAutoFix = async (error: SandpackError, callback: () => void) => {
		console.log('Auto fixing error:', error)
		if (selectedArtifact?.chatSession) {
			const fixMessage = {
				role: 'user',
				text: 'Getting this error: \n' + error.message + '\nCan you please fix the code for me and return the updated code?',
				attachments: [] as Attachment[],
			} as Message

			const updatedChatSession = {
				...selectedArtifact?.chatSession,
				messages: [...selectedArtifact?.chatSession?.messages, fixMessage],
			}
			await handleUpdateArtifact(updatedChatSession, selectedArtifact)
			callback()
		}
	}

	const onSandpackError = (error: SandpackError) => {
		console.log('Sandpack error:', error, selectedArtifact)
		// if(selectedArtifact?.error) {
		//   return;
		// }
		// const updatedArtifact = {
		//   ...selectedArtifact,
		//   status: "error",
		//   error: error,
		// } as Artifact;

		// updateProjectAndArtifact(
		//   (prevProject) => ({
		//     ...prevProject!,
		//     artifacts: prevProject?.artifacts?.map((a) =>
		//       a.id === updatedArtifact.id ? updatedArtifact : a
		//     ) || [],
		//   }),
		//   updatedArtifact
		// );

		// console.log("Error udpatedArtifact: ", updatedArtifact);
	}

	const onSuccess = () => {
		// console.log('Success')
		// if(selectedArtifact?.status !== "error") {
		//   return;
		// }
		// const updatedArtifact = {
		//   ...selectedArtifact,
		//   status: "idle",
		//   error: null,
		// } as Artifact;
		// updateProjectAndArtifact(
		//   (prevProject) => ({
		//     ...prevProject!,
		//     artifacts: prevProject?.artifacts?.map((a) =>
		//       a.id === updatedArtifact.id ? updatedArtifact : a
		//     ) || [],
		//   }),
		//   updatedArtifact
		// );
	}

	const showAlert = useCallback((type: 'error' | 'info' | 'warning' | 'success', message: string) => {
		setAlert({ type, message })
	}, [])

	const handleSelectArtifact = (artifact: Artifact) => {
		setSelectedArtifact(artifact)
	}

	const handleShare = useCallback(() => {
		setShowShareModal(true)
	}, [])

	const handleDelete = () => {
		setShowDeleteConfirmation(true)
	}

	const handleDeleteConfirm = async () => {
		setIsDeleting(true)
		try {
			await projectApi.deleteProject(projectId)
			showAlert('success', 'Project deleted successfully!')
			router.push('/dashboard')
		} catch (error) {
			console.error('Error deleting project:', error)
			showAlert('error', 'Failed to delete project')
		} finally {
			setIsDeleting(false)
			setShowDeleteConfirmation(false)
		}
	}

	const handleDeleteCancel = () => {
		setShowDeleteConfirmation(false)
	}

	const extractComponentName = (code: string): string => {
		const match = code.match(/export default (\w+)/)
		return match ? match[1] : 'MyApp'
	}

	const handleCreateArtifact = async (name: string, description: string, attachments: Attachment[], callback: () => void) => {
		console.log('Creating artifact with name:', name)
		console.log('Creating artifact with description:', description)
		console.log('Creating artifact with attachments:', attachments)

		let newArtifact = {
			id: uuidv4(),
			name: name,
			displayName: name, // Use the provided name for both name and displayName
			code: defaultCode,
			dependencies: defaultDependencies,
			description,
			projectId,
			status: 'creating',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		} as Artifact

		try {
			if (!project) {
				throw new Error('Project is not loaded')
			}

			// Generate user message for the artifact
			let userMessage = `Build me an artifact based on the following information:

**Name of the artifact:** ${name}

**Description and requirements:**
${description}
`

			// Create a new chat session
			let chatSession: ChatSession = {
				id: Date.now().toString(),
				artifactId: newArtifact.id,
				messages: [{ role: 'user', text: userMessage, attachments: attachments }],
				attachments: [],
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				user: 'user',
				model: 'bedrock-claude-3.5-sonnet',
			}

			newArtifact = {
				...newArtifact,
				chatSession: chatSession,
			}

			newArtifact = await artifactApi.createArtifact(project.id, newArtifact)
			callback()
			setShowCreateForm(false)
			setMode('editor')
			updateProjectAndArtifact(
				(prevProject) => ({
					...prevProject!,
					artifacts: [...(prevProject?.artifacts || []), newArtifact],
				}),
				newArtifact
			)

			const messages: Message[] = [
				{
					role: 'user',
					text: userMessage,
					attachments: attachments,
				},
			]

			let response = ''
			const onChunk = (chunks: { index: number; type: string; text: string }[]) => {
				for (const chunk of chunks) {
					response += chunk.text
					// if (response.includes('</CODE>')) {
					// 	if (generatedCode === '') {
					// 		const parsedResponse = parseResponse(response)
					// 		generatedCode = parsedResponse.CODE || ''
					// 		const dependencies = parseExtraLibraries(parsedResponse.EXTRA_LIBRARIES || '')
					//     console.log('newArtifact before:', newArtifact)
					// 		newArtifact = {
					// 			...newArtifact,
					// 			name: extractComponentName(generatedCode),
					// 			displayName: name,
					// 			code: generatedCode,
					// 			dependencies: [...defaultDependencies, ...dependencies],
					// 		}
					//     console.log('Generated code:', generatedCode);
					//     console.log('Response:', response);
					//     console.log('parsedResponse:', parsedResponse);
					//     console.log('newArtifact after:', newArtifact);

					// 		updateProjectAndArtifact(
					// 			(prevProject) => ({
					// 				...prevProject!,
					// 				artifacts: prevProject?.artifacts?.map((a) => (a.id === newArtifact.id ? newArtifact : a)) || [],
					// 			}),
					// 			newArtifact
					// 		)
					// 	}
					// 	setMode('preview')
					// }
					setStreamingMessage({
						role: 'assistant',
						text: response,
					})
				}
			}

			console.log('Generating response with messages:', messages)
			const { code, dependencies } = await genAiApi.generateResponse(messages, project, newArtifact, onChunk, chatSession.model)

			chatSession = {
				...chatSession,
				messages: [...chatSession.messages, { role: 'assistant', text: response }],
			}

			const componentName = extractComponentName(code)
			if (componentName === 'MyApp') {
				showAlert(
					'warning',
					'Oops! It seems like code genie failed to generate the complete code. Please try again with a different model or break down your use case into smaller artifacts.'
				)
			}

			newArtifact = {
				...newArtifact,
				name: componentName,
				displayName: name,
				code: code,
				dependencies: [...defaultDependencies, ...dependencies],
				status: 'idle',
				chatSession: chatSession,
			}

			updateProjectAndArtifact(
				(prevProject) => ({
					...prevProject!,
					artifacts: prevProject?.artifacts?.map((a) => (a.id === newArtifact.id ? newArtifact : a)) || [],
				}),
				newArtifact
			)
			setStreamingMessage(null)
			setMode('preview')

			await artifactApi.updateArtifact(projectId, newArtifact.id, {
				name: componentName,
				displayName: name,
				code: code,
				dependencies: [...defaultDependencies, ...dependencies],
				status: 'idle',
				chatSession: chatSession,
			})

			showAlert('success', 'Artifact created successfully')
		} catch (error) {
			console.error('Error creating artifact or generating code:', error)
			toast.error('Failed to create artifact or generate code', {
				duration: 3000,
			})
			showAlert('error', 'Failed to create artifact')
		} finally {
			setShowCreateForm(false)
			setMode('preview')
			callback()
		}
	}

	const handleDeleteArtifact = (artifact: Artifact) => {
		setArtifactToDelete(artifact)
		setShowDeleteArtifactConfirmation(true)
	}

	const handleRenameArtifact = (artifact: Artifact) => {
		setArtifactToRename(artifact)
		setNewArtifactName(artifact.displayName || artifact.name || '')
		setShowRenameModal(true)
	}

	const handleRenameConfirm = async () => {
		if (artifactToRename) {
			try {
				await artifactApi.updateArtifact(projectId, artifactToRename.id, {
					displayName: newArtifactName,
				})
				updateProjectAndArtifact(
					(prevProject) => ({
						...prevProject!,
						artifacts:
							prevProject?.artifacts?.map((a) => (a.id === artifactToRename.id ? { ...a, displayName: newArtifactName } : a)) || [],
					}),
					selectedArtifact
				)
			} catch (error) {
				console.error('Error renaming artifact:', error)
				showAlert('error', 'Failed to rename artifact')
			} finally {
				setShowRenameModal(false)
				setArtifactToRename(null)
			}
		}
	}

	const handleDuplicateArtifact = async (artifact: Artifact) => {
		try {
			const newArtifactData = {
				...artifact,
				id: uuidv4(),
				name: `${artifact.name} (COPY)`,
			}
			const newArtifact = await artifactApi.createArtifact(projectId, newArtifactData)
			updateProjectAndArtifact(
				(prevProject) => ({
					...prevProject!,
					artifacts: [...(prevProject?.artifacts || []), newArtifact],
				}),
				newArtifact
			)
		} catch (error) {
			console.error('Error duplicating artifact:', error)
			showAlert('error', 'Failed to duplicate artifact')
		} finally {
			// Any cleanup code if needed
		}
	}

	const handleArtifactHover = (artifact: Artifact | null, event: React.MouseEvent) => {
		setHoveredArtifact(artifact)
		setMousePosition({ x: event.clientX, y: event.clientY })
	}

	const confirmDeleteArtifact = async (): Promise<string> => {
		if (artifactToDelete) {
			try {
				await artifactApi.deleteArtifact(projectId, artifactToDelete.id)

				updateProjectAndArtifact(
					(prevProject) => {
						const updatedArtifacts = prevProject?.artifacts?.filter((a) => a.id !== artifactToDelete.id) || []
						return {
							...prevProject!,
							artifacts: updatedArtifacts,
						}
					},
					project?.artifacts?.find((a) => a.id !== artifactToDelete.id) || null
				)

				showAlert('success', 'Artifact deleted successfully')
				return 'Artifact deleted successfully' // Return a success message
			} catch (error) {
				console.error('Error deleting artifact:', error)
				showAlert('error', 'Failed to delete artifact')
				return 'Failed to delete artifact' // Return an error message
			} finally {
				setShowDeleteArtifactConfirmation(false)
				setArtifactToDelete(null)
			}
		}
		return 'No artifact to delete' // Return a message if there's no artifact to delete
	}

	const handleUpdateArtifact = useCallback(
		async (chatSession: ChatSession, artifact: Artifact) => {
			try {
				// Update the project state with the new chat session
				updateProjectAndArtifact(
					(prevProject) => ({
						...prevProject!,
						artifacts: prevProject?.artifacts?.map((a) => (a.id === artifact.id ? { ...a, status: 'updating', chatSession } : a)) || [],
					}),
					{ ...artifact, status: 'updating', chatSession } as Artifact
				)
				setMode('editor')
				let response = ''
				const onChunk = (chunks: { index: number; type: string; text: string }[]) => {
					for (const chunk of chunks) {
						response += chunk.text
						// if (response.includes('</CODE>')) {
						// 	if (generatedCode === '') {
						// 		const parsedResponse = parseResponse(response)
						// 		generatedCode = parsedResponse.CODE || '';
						//     console.log('Generated code:', generatedCode);
						// 		const dependencies = parseExtraLibraries(parsedResponse.EXTRA_LIBRARIES || '')
						// 		updateProjectAndArtifact(
						// 			(prevProject) => ({
						// 				...prevProject!,
						// 				artifacts: prevProject?.artifacts?.map((a) => (a.id === artifact.id ? artifact : a)) || [],
						// 			}),
						// 			{
						// 				...artifact,
						// 				name: extractComponentName(generatedCode),
						// 				code: generatedCode,
						// 				dependencies: [...defaultDependencies, ...dependencies, ...(artifact?.dependencies || [])],
						// 			}
						// 		)
						// 	}
						// 	setMode('preview')
						// }
						setStreamingMessage({
							role: 'assistant',
							text: response,
						})
					}
				}

				let messages = chatSession.messages

				if (chatSession.messages.length > 3) {
					messages = [
						chatSession.messages[0],
						chatSession.messages[1],
						chatSession.messages[chatSession.messages.length - 3],
						chatSession.messages[chatSession.messages.length - 2],
						chatSession.messages[chatSession.messages.length - 1],
					] as Message[]
				}

				console.log('Generating response with messages:', messages)
				const { code, dependencies: extractedDependencies } = await genAiApi.generateResponse(
					messages,
					project,
					artifact,
					onChunk,
					chatSession.model
				)

				const updatedChatSession = {
					...chatSession,
					messages: [...chatSession.messages, { role: 'assistant', text: response }],
				} as ChatSession

				const componentName = extractComponentName(code)

				if (componentName === 'MyApp') {
					showAlert(
						'warning',
						'Oops! It seems like code genie failed to generate the complete code. Please try again with a different model or break down your use case into smaller artifacts.'
					)
				}

				const updatedArtifact = {
					...artifact,
					name: componentName,
					code: code,
					dependencies: [...defaultDependencies, ...extractedDependencies, artifact.dependencies],
					status: 'idle',
					chatSession: updatedChatSession,
				} as Artifact

				updateProjectAndArtifact(
					(prevProject) => ({
						...prevProject!,
						artifacts: prevProject?.artifacts?.map((a) => (a.id === updatedArtifact.id ? updatedArtifact : a)) || [],
					}),
					updatedArtifact
				)
				setStreamingMessage(null)
				setMode('preview')

				await artifactApi.updateArtifact(projectId, updatedArtifact.id, {
					name: componentName,
					code: code,
					dependencies: [...defaultDependencies, ...extractedDependencies],
					status: 'idle',
					chatSession: updatedChatSession,
				})

				showAlert('success', 'Artifact updated successfully')
			} catch (error) {
				console.error('Error updating artifact or generating code:', error)
				showAlert('error', 'Failed to update artifact or generate code')
			}
		},
		[updateProjectAndArtifact, projectId, showAlert, project]
	)

	const handleDashboardClick = useCallback(() => {
		router.push('/dashboard')
	}, [router])

	const handleUpdateAccessLevel = async (email: string, accessLevel: AccessLevel | 'revoke') => {
		console.log('Adding contributor:', email, accessLevel)
		if (!project) {
			setAlert({
				type: 'error',
				message: 'Failed to add contributor. Please try again.',
			})
			return
		}
		const { success } = await projectApi.shareProject(project?.id, email, accessLevel)
		if (!success) {
			setAlert({
				type: 'error',
				message: 'Failed to add contributor. Please try again.',
			})
			return
		}
		setAlert({
			type: 'success',
			message: accessLevel === 'revoke' ? 'Access revoked successfully' : 'Access updated successfully',
		})
		if (accessLevel === 'revoke') {
			setProject((prevProject) => {
				if (!prevProject) return null
				return {
					...prevProject,
					contributors: prevProject?.contributors?.filter((contributor) => contributor.email !== email),
				}
			})
		} else {
			setProject((prevProject) => {
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
		if (!project) {
			setAlert({
				type: 'error',
				message: 'Failed to add contributor. Please try again.',
			})
			return
		}
		const { success } = await projectApi.shareProject(project?.id, email, accessLevel)
		if (!success) {
			setAlert({
				type: 'error',
				message: 'Failed to add contributor. Please try again.',
			})
			return
		}
		setAlert({
			type: 'success',
			message: accessLevel === 'revoke' ? 'Access revoked successfully' : 'Contributor added successfully',
		})
		if (accessLevel === 'revoke') {
			return
		} else {
			setProject((prevProject) => {
				if (!prevProject) return null
				return {
					...prevProject,
					contributors: [...(prevProject.contributors || []), { email, accessLevel }],
				}
			})
		}
	}

	const handleProjectTitleUpdate = useCallback(
		async (newTitle: string) => {
			try {
				await projectApi.updateProject(projectId, { title: newTitle })
				setProject((prevProject) => (prevProject ? { ...prevProject, title: newTitle } : null))
				showAlert('success', 'Project title updated successfully')
			} catch (error) {
				console.error('Error updating project title:', error)
				showAlert('error', 'Failed to update project title')
			}
		},
		[projectId, showAlert]
	)

	const handlePublishArtifact = async (artifact: Artifact) => {
		console.log('Publishing artifact:', artifact)
		const { success, url } = await artifactApi.publish(artifact)
		if (success) {
			updateProjectAndArtifact(
				(prevProject) => ({
					...prevProject!,
					artifacts: prevProject?.artifacts?.map((a) => (a.id === artifact.id ? { ...a, publishedUrl: url } : a)) || [],
				}),
				artifact.id == selectedArtifact?.id ? { ...artifact, publishedUrl: url } as Artifact : artifact
			)
			showAlert('success', 'Artifact published successfully!')
			await artifactApi.updateArtifact(projectId, artifact.id, { publishedUrl: url })
		}
		console.log('Artifact published:', artifact)
	}

	if (isLoading) {
		return (
			<div className="flex h-screen flex-col items-center justify-center bg-gray-50">
				<CircularProgress size={64} />
				<h2 className="mb-2 mt-4 text-2xl font-semibold text-gray-700">Preparing Your Workspace</h2>
				<p className="text-gray-500">Loading project details and artifacts...</p>
			</div>
		)
	}

	if (error) {
		return (
			<div className="flex h-screen flex-col items-center justify-center bg-gray-50">
				<svg
					className="mb-4 h-16 w-16 text-red-500"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<h2 className="mb-2 text-2xl font-semibold text-gray-700">Oops! Something went wrong</h2>
				<p className="mb-4 text-gray-500">{error}</p>
				<button
					onClick={() => router.push('/dashboard')}
					className="rounded-full bg-blue-500 px-6 py-2 text-white transition-colors hover:bg-blue-600"
				>
					Back to Dashboard
				</button>
			</div>
		)
	}

	if (!project) {
		return (
			<div className="flex h-screen flex-col items-center justify-center bg-gray-50">
				<svg
					className="mb-4 h-16 w-16 text-yellow-500"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
					/>
				</svg>
				<h2 className="mb-2 text-2xl font-semibold text-gray-700">Project Not Found</h2>
				<p className="mb-4 text-gray-500">
					{/* eslint-disable-next-line react/no-unescaped-entities */}
					The project you're looking for doesn't exist or has been deleted.
				</p>
				<button
					onClick={() => router.push('/dashboard')}
					className="rounded-full bg-blue-500 px-6 py-2 text-white transition-colors hover:bg-blue-600"
				>
					Back to Dashboard
				</button>
			</div>
		)
	}

	return (
		<div className="flex h-screen flex-col">
			<ProjectHeader
				user={user}
				project={project}
				onDashboardClick={handleDashboardClick}
				onShare={handleShare}
				onProjectTitleUpdate={handleProjectTitleUpdate}
			/>
			<div className="flex flex-1 flex-col overflow-hidden pt-6" style={{ marginTop: '64px' }}>
				{project.artifacts && project.artifacts.length > 0 ? (
					<PanelGroup direction="horizontal" className="flex-1">
						<Panel defaultSize={20} minSize={0} maxSize={100} collapsible={true}>
							<ArtifactList
								artifacts={project.artifacts || []}
								onSelectArtifact={handleSelectArtifact}
								selectedArtifact={selectedArtifact}
								isCollapsed={isArtifactListCollapsed}
								setIsCollapsed={setIsArtifactListCollapsed}
								onCreateArtifact={() => setShowCreateForm(true)}
								onDeleteArtifact={handleDeleteArtifact}
								onArtifactHover={handleArtifactHover}
								onDuplicateArtifact={handleDuplicateArtifact}
								onRenameArtifact={handleRenameArtifact}
								isViewer={project?.accessLevel === 'viewer'}
								onPublish={handlePublishArtifact}
							/>
						</Panel>
						{!isArtifactListCollapsed && <PanelResizeHandle className="w-1 bg-gray-200 transition-colors hover:bg-gray-300" />}
						<Panel defaultSize={60} minSize={40} maxSize={100}>
							<div className="h-full">
								{selectedArtifact &&
									(mode === 'preview' ? (
										<Preview
											project={project}
											selectedArtifact={selectedArtifact}
											initialMode={mode}
											onAutoFix={onAutoFix}
											onSandpackError={onSandpackError}
											onSuccess={onSuccess}
										/>
									) : (
										<CodeViewer status={selectedArtifact.status} code={parseResponse(streamingMessage?.text || '')?.CODE || ''} />
									))}
							</div>
						</Panel>
						{!isUpdateArtifactCollapsed && <PanelResizeHandle className="w-1 bg-gray-200 transition-colors hover:bg-gray-300" />}
						<Panel defaultSize={20} minSize={0} maxSize={100} collapsible={true}>
							{selectedArtifact && project?.accessLevel !== 'viewer' && (
								<UpdateArtifact
									artifact={selectedArtifact}
									isCollapsed={isUpdateArtifactCollapsed}
									setIsCollapsed={setIsUpdateArtifactCollapsed}
									streamingMessage={streamingMessage}
									onUpdateArtifact={handleUpdateArtifact}
								/>
							)}
						</Panel>
					</PanelGroup>
				) : (
					<EmptyArtifactsMessage
						onCreateArtifact={() => project?.accessLevel !== 'viewer' && setShowCreateForm(true)}
						isViewer={project?.accessLevel === 'viewer'}
					/>
				)}
			</div>
			{showDeleteConfirmation && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
					<div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
						<h3 className="mb-4 text-xl font-semibold">Confirm Deletion</h3>
						<p className="mb-6 text-gray-600">Are you sure you want to delete this project? This action cannot be undone.</p>
						<div className="flex justify-end space-x-4">
							<button
								onClick={handleDeleteCancel}
								className="rounded-md bg-gray-200 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-300"
								disabled={isDeleting}
							>
								Cancel
							</button>
							<button
								onClick={handleDeleteConfirm}
								className="rounded-md bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
								disabled={isDeleting}
							>
								{isDeleting ? 'Deleting...' : 'Delete'}
							</button>
						</div>
					</div>
				</div>
			)}
			{showRenameModal && artifactToRename && (
				<div className="fixed inset-0 z-50 flex items-center justify-center">
					<div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowRenameModal(false)}></div>
					<div className="relative z-10">
						<RenameDialog
							message={
								<>
									Set the new name for <span className="font-semibold text-blue-600">{artifactToRename.name}</span> arifact
									<input
										type="text"
										value={newArtifactName}
										onChange={(e) => setNewArtifactName(e.target.value)}
										className="my-4 w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
										autoFocus
									/>
								</>
							}
							onConfirm={handleRenameConfirm}
							onCancel={() => setShowRenameModal(false)}
						/>
					</div>
				</div>
			)}
			{showCreateForm && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4 backdrop-blur-[2px]">
					<ArtifactOverviewInputForm onCancel={() => setShowCreateForm(false)} onNext={handleCreateArtifact} />
				</div>
			)}
			{showShareModal && (
				<ProjectShareModal
					isOpen={showShareModal}
					onClose={() => setShowShareModal(false)}
					project={project}
					onUpdateAccessLevel={handleUpdateAccessLevel}
					onAddContributor={handleAddContributor}
				/>
			)}
			{showDeleteArtifactConfirmation && artifactToDelete && (
				<div className="fixed inset-0 z-50 flex items-center justify-center">
					<div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowDeleteArtifactConfirmation(false)}></div>
					<div className="relative z-10">
						<ConfirmationDialog
							message={
								<>
									Are you sure you want to <i>permanently</i> delete the artifact{' '}
									<span className="font-semibold text-blue-600">{artifactToDelete.name}</span>?
								</>
							}
							onConfirm={confirmDeleteArtifact}
							onCancel={() => setShowDeleteArtifactConfirmation(false)}
						/>
					</div>
				</div>
			)}
			{hoveredArtifact && <ArtifactInfoCard artifact={hoveredArtifact} position={mousePosition} onClose={() => setHoveredArtifact(null)} />}
			{alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
		</div>
	)
}

WorkspaceComponent.displayName = 'Workspace'
export default memo(WorkspaceComponent)
