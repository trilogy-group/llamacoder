import React, { useState, useEffect, useCallback, useRef } from 'react'
import ChatHistory from './ChatHistory'
import InputForm from './InputForm'
import ArtifactInfo from './ArtifactInfo'
import { Artifact } from '../types/Artifact'
import { Message } from '../types/Message'
import { ChatSession } from '../types/ChatSession'
import { Attachment } from '../types/Attachment'
import StreamingMessage from './StreamingMessage'

interface UpdateArtifactProps {
	artifact: Artifact
	streamingMessage: Message | null
	isCollapsed: boolean
	setIsCollapsed: (collapsed: boolean) => void
	onUpdateArtifact: (chatSession: ChatSession, artifact: Artifact) => void
}

const UpdateArtifact: React.FC<UpdateArtifactProps> = ({ artifact, streamingMessage, isCollapsed, setIsCollapsed, onUpdateArtifact }) => {
	const [chatSession, setChatSession] = useState<ChatSession>(() => {
		return (
			artifact.chatSession || {
				id: Date.now().toString(),
				artifactId: artifact.id,
				messages: [],
				attachments: [],
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				user: 'current_user',
				model: 'bedrock-claude-3.5-sonnet',
			}
		)
	})

	const streamingMessageRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (artifact.chatSession) {
			setChatSession(artifact.chatSession)
		}
	}, [artifact.chatSession])

	useEffect(() => {
		if (streamingMessageRef.current) {
			streamingMessageRef.current.scrollIntoView({ behavior: 'instant', block: 'end' })
		}
	}, [streamingMessage, artifact.status])

	const handleSubmit = useCallback(
		(text: string, attachments: Attachment[]) => {
			if (text.trim()) {
				const newMessage: Message = {
					text: text,
					role: 'user',
					attachments: attachments,
				}
				const updatedSession = {
					...chatSession,
					messages: [...chatSession.messages, newMessage],
					updatedAt: new Date().toISOString(),
				}
				setChatSession(updatedSession)
				onUpdateArtifact(updatedSession, artifact)
			}
		},
		[chatSession, artifact, onUpdateArtifact]
	)

	const handleModelChange = useCallback(
		(model: string) => {
			const updatedSession = {
				...chatSession,
				model: model,
				updatedAt: new Date().toISOString(),
			}
			setChatSession(updatedSession)
		},
		[chatSession]
	)

	const renderContent = () => {
		return (
			<>
				<div className="flex flex-col flex-grow overflow-hidden">
					<div className="flex-grow overflow-y-auto">
						<ChatHistory artifact={artifact} chatSession={chatSession} />
						<StreamingMessage
							ref={streamingMessageRef}
							message={streamingMessage}
							isThinking={!streamingMessage && (artifact.status === 'creating' || artifact.status === 'updating')}
						/>
					</div>
				</div>
				<InputForm
					artifact={artifact}
					onSubmit={handleSubmit}
					isEmpty={chatSession.messages.length === 0}
					selectedModel={chatSession.model}
					onModelChange={handleModelChange}
				/>
			</>
		)
	}

	return (
		<div className="flex h-full w-full flex-col overflow-hidden rounded-lg bg-white shadow-sm">
			{!isCollapsed && (
				<>
					<div className="flex-shrink-0">
						<ArtifactInfo artifact={artifact} />
					</div>
					{renderContent()}
				</>
			)}
		</div>
	)
}

export default React.memo(UpdateArtifact)
