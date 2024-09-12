import React, { memo, forwardRef } from 'react'
import { Message } from '../types/Message'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { FiLoader } from 'react-icons/fi'

interface StreamingMessageProps {
	message: Message | null
	isThinking: boolean
}

const StreamingMessage = forwardRef<HTMLDivElement, StreamingMessageProps>(({ message, isThinking }, ref) => {
	const renderContent = () => {
		if (isThinking) {
			return (
				<div className="flex items-center justify-center p-4">
					<FiLoader className="animate-spin text-blue-500" size={24} />
					<span className="ml-2 text-xs text-gray-700">Thinking...</span>
				</div>
			)
		}

		if (!message) {
			return null
		}

		return (
			<div className="relative rounded-lg border border-transparent bg-blue-50 shadow-sm transition-colors duration-200">
				<div className="flex flex-col">
					<div className="p-3">
						<div className="break-words text-xs text-gray-800">{renderMessageContent(message.text)}</div>
					</div>
				</div>
			</div>
		)
	}

	const renderMessageContent = (text: string): React.ReactNode => {
		const parts = text.split(
			/(<CODE>[\s\S]*?<\/CODE>|<ANALYSIS>[\s\S]*?<\/ANALYSIS>|<VERIFICATION>[\s\S]*?<\/VERIFICATION>|<EXTRA_LIBRARIES>[\s\S]*?<\/EXTRA_LIBRARIES>|<EXPLANATION>[\s\S]*?<\/EXPLANATION>)/
		)

		return parts.map((part, index) => {
			if (!part.trim()) return null

			if (part.startsWith('<CODE>') && part.endsWith('</CODE>')) {
				return renderCodeBlock(part.slice(6, -7).trim(), `streaming-code-${index}`)
			} else if (part.startsWith('<ANALYSIS>') && part.endsWith('</ANALYSIS>')) {
				return renderSpecialBlock(part.slice(10, -11).trim(), 'Analysis', index, '🔬', 'purple')
			} else if (part.startsWith('<VERIFICATION>') && part.endsWith('</VERIFICATION>')) {
				return renderSpecialBlock(part.slice(14, -15).trim(), 'Verification', index, '✅', 'green')
			} else if (part.startsWith('<EXTRA_LIBRARIES>') && part.endsWith('</EXTRA_LIBRARIES>')) {
				return renderCodeBlock(part.slice(17, -18).trim(), `streaming-libraries-${index}`, 'bash')
			} else if (part.startsWith('<EXPLANATION>') && part.endsWith('</EXPLANATION>')) {
				return renderSpecialBlock(part.slice(13, -14).trim(), 'Explanation', index, '💡', 'blue')
			}

			const match = part.match(/<(CODE|ANALYSIS|VERIFICATION|EXTRA_LIBRARIES|EXPLANATION)>/)
			if (match) {
				const type = match[1]
				return (
					<React.Fragment key={`streaming-${index}`}>
						<Markdown remarkPlugins={[remarkGfm]} className="text-xs">
							{part.slice(0, match.index).trim()}
						</Markdown>
						{renderStreamingIndicator(type)}
					</React.Fragment>
				)
			}

			return (
				<Markdown key={`streaming-${index}`} remarkPlugins={[remarkGfm]} className="text-xs">
					{part.trim()}
				</Markdown>
			)
		})
	}

	const renderCodeBlock = (code: string, blockId: string, language: string = 'typescript') => (
		<div key={blockId} className="relative">
			<SyntaxHighlighter 
				language={language} 
				style={tomorrow} 
				className="my-2 rounded-md text-xs max-h-[300px] overflow-y-auto"
			>
				{code}
			</SyntaxHighlighter>
		</div>
	)

	const renderSpecialBlock = (content: string, title: string, index: number, emoji: string, color: string) => {
		let borderColorClass = 'border-gray-500'
		let titleColorClass = 'text-white'
		let bgColorClass = 'bg-gray-800'

		if (color === 'green') {
			borderColorClass = 'border-green-400'
			titleColorClass = 'text-green-300'
			bgColorClass = 'bg-gray-900'
		} else if (color === 'purple') {
			borderColorClass = 'border-purple-400'
			titleColorClass = 'text-purple-300'
			bgColorClass = 'bg-gray-900'
		} else if (color === 'blue') {
			borderColorClass = 'border-blue-400'
			titleColorClass = 'text-blue-300'
			bgColorClass = 'bg-gray-900'
		}

		return (
			<div
				key={`streaming-${title.toLowerCase()}-${index}`}
				className={`${bgColorClass} my-2 rounded-md border p-3 text-white ${borderColorClass} w-full max-h-[300px] overflow-y-auto`}
			>
				<div className="mb-2 flex items-center">
					<span className="mr-2" role="img" aria-label={title}>
						{emoji}
					</span>
					<span className={`font-semibold ${titleColorClass}`}>{title}</span>
				</div>
				<div className="overflow-wrap-break-word w-full">
					<Markdown
						remarkPlugins={[remarkGfm]}
						components={{
							p: ({ children }) => <p className="mb-2 w-full last:mb-0">{children}</p>,
							ul: ({ children }) => <ul className="mb-2 w-full list-disc pl-4 last:mb-0">{children}</ul>,
							ol: ({ children }) => <ol className="mb-2 w-full list-decimal pl-4 last:mb-0">{children}</ol>,
							li: ({ children }) => <li className="mb-1 w-full last:mb-0">{children}</li>,
						}}
						className="w-full text-xs"
					>
						{content}
					</Markdown>
				</div>
			</div>
		)
	}

	const renderStreamingIndicator = (type: string) => {
		const messages = {
			CODE: 'Generating code',
			ANALYSIS: 'Analyzing',
			VERIFICATION: 'Verifying',
			EXTRA_LIBRARIES: 'Checking libraries',
		}
		const message = messages[type as keyof typeof messages] || 'Processing'

		return (
			<div key="streaming-indicator" className="flex items-center space-x-2 rounded-md bg-gray-100 p-2">
				<FiLoader className="animate-spin text-blue-500" />
				<span className="text-sm text-gray-700">{message}...</span>
			</div>
		)
	}

	return (
		<div ref={ref} className="w-full p-4">
			{renderContent()}
		</div>
	)
})

StreamingMessage.displayName = 'StreamingMessage'

export default StreamingMessage
