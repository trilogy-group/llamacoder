import { AccessLevel, Contributor, Project } from '@/types/Project'
import { MenuItem, Select, styled } from '@mui/material'
import React, { useState } from 'react'
import { FiEdit2, FiEye, FiUser, FiX } from 'react-icons/fi'
import { toast } from 'sonner'
import EditAccessModal from './EditAccessModal'

interface ShareProjectModalProps {
	isOpen: boolean
	onClose: () => void
	project: Project
	onUpdateAccessLevel: (email: string, newAccessLevel: AccessLevel | 'revoke') => Promise<void>
	onAddContributor: (email: string, accessLevel: AccessLevel) => Promise<void>
}

const StyledSelect = styled(Select)(({ theme }) => ({
	'& .MuiOutlinedInput-notchedOutline': {
		borderRadius: '12px',
	},
	'&:hover .MuiOutlinedInput-notchedOutline': {
		borderColor: theme.palette.primary.main,
	},
	'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
		borderColor: theme.palette.primary.main,
		borderWidth: '2px',
	},
}))

const ProjectShareModal: React.FC<ShareProjectModalProps> = ({ isOpen, onClose, project, onUpdateAccessLevel, onAddContributor }) => {
	const [email, setEmail] = useState('')
	const [accessLevel, setAccessLevel] = useState('viewer')
	const [editingUser, setEditingUser] = useState<Contributor | null>(null)
	const [isShareInProgress, setIsShareInProgress] = useState(false)
	const [isAccessUpdateInProgress, setIsAccessUpdateInProgress] = useState(false)
	const [updatingContributorEmail, setUpdatingContributorEmail] = useState<string | null>(null)

	const handleEditAccess = (user: Contributor) => {
		setEditingUser(user)
	}

	const handleAccessUpdate = async (email: string, newAccessLevel: AccessLevel | 'revoke') => {
		try {
			setIsAccessUpdateInProgress(true)
			setUpdatingContributorEmail(email)
			await onUpdateAccessLevel(email, newAccessLevel)
		} catch (error) {
			console.error('Error updating access level:', error)
			toast.error(`Failed to update access level for ${email}`, {
				duration: 3000,
				position: 'top-center',
			})
		} finally {
			setEditingUser(null)
			setIsAccessUpdateInProgress(false)
			setUpdatingContributorEmail(null)
		}
	}

	const handleShare = async () => {
		setIsShareInProgress(true)
		try {
			await onAddContributor(email, accessLevel as AccessLevel)
		} catch (error) {
			console.error('Error sharing project:', error)
			toast.error('Failed to share project', {
				duration: 3000,
				position: 'top-center',
			})
		} finally {
			setIsShareInProgress(false)
		}
	}

	const copyLinkToClipboard = () => {
		const link = `${window.location.origin}/workspaces/${project.id}`
		navigator.clipboard.writeText(link)
		toast.success('Link copied to clipboard')
	}

	const getAccessLevelIcon = (accessLevel: AccessLevel) => {
		switch (accessLevel) {
			case 'owner':
				return <FiUser className="h-4 w-4 text-purple-600" />
			case 'editor':
				return <FiEdit2 className="h-4 w-4 text-orange-600" />
			case 'viewer':
				return <FiEye className="h-4 w-4 text-green-600" />
			default:
				return null
		}
	}

	if (!isOpen) return null

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
			<div className="w-full max-w-md rounded-lg bg-white p-4 shadow-lg">
				<div className="mb-3 flex items-center justify-between">
					<div>
						<h2 className="text-lg font-semibold text-gray-800">Share Project</h2>
						<p className="text-sm text-blue-600">{project.title}</p>
					</div>
					<button onClick={onClose} className="text-gray-500 hover:text-gray-700">
						<FiX size={20} />
					</button>
				</div>

				{/* Email input and access level select */}
				<div className="mb-3 space-y-2">
					<input
						type="email"
						placeholder="Enter email address"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
					<StyledSelect
						value={accessLevel}
						onChange={(e) => setAccessLevel(e.target.value as AccessLevel)}
						fullWidth
						variant="outlined"
						size="small"
					>
						<MenuItem value="viewer">Can view</MenuItem>
						{project.accessLevel !== 'viewer' && <MenuItem value="editor">Can edit</MenuItem>}
					</StyledSelect>
				</div>

				{/* Share button */}
				<button
					onClick={handleShare}
					disabled={isShareInProgress || !email}
					className={`relative w-full rounded-full p-2 text-sm font-medium text-white transition duration-300 ease-in-out ${
						isShareInProgress || !email ? 'cursor-not-allowed bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'
					} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
				>
					{isShareInProgress ? (
						<>
							<span className="opacity-0">Share</span>
							<div className="absolute inset-0 flex items-center justify-center">
								<div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
							</div>
						</>
					) : (
						'Share'
					)}
				</button>

				{/* Shareable link */}
				<div className="mb-3 mt-3 rounded-md border border-gray-200 bg-gray-50 p-2">
					<span className="mb-1 block text-xs font-medium text-gray-600">Shareable Link</span>
					<div className="flex items-center justify-between">
						<span className="mr-2 truncate text-xs text-gray-500">{`${window.location.origin}/workspaces/${project.id}`}</span>
						<button onClick={copyLinkToClipboard} className="text-xs text-blue-500 transition duration-300 ease-in-out hover:text-blue-600">
							Copy
						</button>
					</div>
				</div>

				{/* Users with access */}
				<div className="mt-3">
					<h3 className="mb-2 text-sm font-semibold text-gray-800">Users with access:</h3>
					<ul className="max-h-28 space-y-1 overflow-y-auto">
						{project.contributors?.map((contributor, index) => (
							<li key={index} className="flex items-center justify-between rounded-md bg-gray-50 p-1.5">
								<div className="flex items-center">
									{getAccessLevelIcon(contributor.accessLevel as AccessLevel)}
									<div>
										<div className="ml-2 text-xs font-semibold text-gray-800">{contributor.name}</div>
										<div className="ml-2 text-xs text-gray-600">{contributor.email}</div>
									</div>
								</div>
								<button
									onClick={() => handleEditAccess(contributor)}
									disabled={isAccessUpdateInProgress && updatingContributorEmail === contributor.email}
									className={`relative ml-2 rounded-full px-4 py-1 text-xs font-medium text-white transition duration-300 ease-in-out ${
										isAccessUpdateInProgress && updatingContributorEmail === contributor.email
											? 'cursor-not-allowed bg-blue-300'
											: 'bg-blue-500 hover:bg-blue-600'
									} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
								>
									{isAccessUpdateInProgress && updatingContributorEmail === contributor.email ? (
										<>
											<span className="opacity-0">Edit Access</span>
											<div className="absolute inset-0 flex items-center justify-center">
												<div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
											</div>
										</>
									) : (
										'Edit Access'
									)}
								</button>
							</li>
						))}
					</ul>
				</div>
			</div>
			{editingUser && (
				<EditAccessModal
					user={editingUser}
					onClose={() => setEditingUser(null)}
					onUpdateAccess={(email, newAccessLevel) => handleAccessUpdate(email, newAccessLevel as AccessLevel | 'revoke')}
					userAccessLevel={project.accessLevel}
				/>
			)}
		</div>
	)
}

export default ProjectShareModal
