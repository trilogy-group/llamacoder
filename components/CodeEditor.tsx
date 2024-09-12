import { parseResponse } from '@/utils/apiClients/GenAI'
import { SandpackError } from '@codesandbox/sandpack-client'
import {
	SandpackCodeEditor,
	SandpackLayout,
	SandpackPreview,
	SandpackProvider,
	useActiveCode,
	useSandpack,
} from '@codesandbox/sandpack-react'
import { dracula as draculaTheme } from '@codesandbox/sandpack-themes'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import CodeIcon from '@mui/icons-material/Code'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import DownloadIcon from '@mui/icons-material/GetApp' // Changed to a more appropriate icon
import RefreshIcon from '@mui/icons-material/Refresh'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { saveAs } from 'file-saver'
import { AnimatePresence } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { Artifact } from '../types/Artifact'
import { Project } from '../types/Project' // Assuming you have a Project type

interface CodeEditorProps {
	project: Project
	selectedArtifact: Artifact
	onAutoFix?: (error: SandpackError, callback: () => void) => void
	onSandpackError?: (error: SandpackError) => void
	onSuccess?: () => void
	children?: React.ReactNode
}

import CircularProgress from '@mui/material/CircularProgress'

function SandpackContent({
	children,
	onAutoFix,
	onSandpackError,
	onReset,
	onSuccess,
	selectedArtifact,
}: {
	children: React.ReactNode
	onAutoFix: (error: SandpackError, callback: () => void) => void
	onSandpackError?: (error: SandpackError) => void
	onReset: () => void
	onSuccess?: () => void
	selectedArtifact: Artifact
}) {
	const [isPreviewOnly, setIsPreviewOnly] = useState(true)

	const { sandpack, listen } = useSandpack()
	const { activeFile, updateFile, error, status } = sandpack
	const { code } = useActiveCode()
	const [statusMessage, setStatusMessage] = useState<string | null>(null)
	const [isAutoFixInProgress, setIsAutoFixInProgress] = useState(false)
	const [currentVersion, setCurrentVersion] = useState(1)
	const [totalVersions, setTotalVersions] = useState(1)

	const handleDownload = () => {
		const blob = new Blob([code], {
			type: 'text/plain;charset=utf-8',
		})
		saveAs(blob, 'App.tsx')
	}

	const handlePrevVersion = () => {
		if (currentVersion > 1) setCurrentVersion(currentVersion - 1)
	}

	const handleNextVersion = () => {
		if (currentVersion < totalVersions) setCurrentVersion(currentVersion + 1)
	}

	useEffect(() => {
		const totalVersions = Math.ceil((selectedArtifact.chatSession?.messages.length || 0) / 2)
		setTotalVersions(totalVersions)
		setCurrentVersion(totalVersions)

		const messageIndex = 2 * totalVersions - 1
		const result = parseResponse(selectedArtifact.chatSession?.messages[messageIndex]?.text || '')
		// TODO: Update this
		// updateFile('/App.tsx', result['CODE'])
	}, [selectedArtifact.chatSession?.messages, updateFile])

	const actionButtons = (
		<div className="absolute bottom-2 left-2 z-20 flex gap-2">
			<button
				onClick={() => setIsPreviewOnly(!isPreviewOnly)}
				className="sp-icon-standalone sp-c-bxeRRt sp-c-gMfcns sp-c-dEbKhQ sp-button flex items-center gap-2"
				title={isPreviewOnly ? 'Show Editor' : 'Show Preview'}
			>
				{isPreviewOnly ? (
					<CodeIcon style={{ width: '16px', height: '16px' }} />
				) : (
					<VisibilityIcon style={{ width: '16px', height: '16px' }} />
				)}
				<span>{isPreviewOnly ? 'Editor' : 'Preview'}</span>
			</button>
			<button
				onClick={handleDownload}
				className="sp-icon-standalone sp-c-bxeRRt sp-c-gMfcns sp-c-dEbKhQ sp-button flex items-center gap-2"
				title="Download Code"
			>
				<DownloadIcon style={{ width: '16px', height: '16px' }} />
			</button>
			<div className="group flex items-center" role="group">
				<button
					onClick={handlePrevVersion}
					className="rounded-l-full bg-[#444759] px-2 py-1 text-sm font-medium text-[#6272A4] group-hover:text-white"
					title="Previous Version"
					disabled={currentVersion === 1}
				>
					<ChevronLeftIcon style={{ width: '16px', height: '16px' }} />
				</button>
				<span className="cursor-default bg-[#444759] py-1 text-sm font-medium text-[#6272A4] group-hover:text-white">
					{`Version ${currentVersion} of ${totalVersions}`}
				</span>
				<button
					onClick={handleNextVersion}
					className="rounded-r-full bg-[#444759] px-2 py-1 text-sm font-medium text-[#6272A4] group-hover:text-white"
					title="Next Version"
					disabled={currentVersion === totalVersions}
				>
					<ChevronRightIcon style={{ width: '16px', height: '16px' }} />
				</button>
			</div>
		</div>
	)

	useEffect(() => {
		if (error) {
			onSandpackError?.(error)
		}
		const stopListening = listen((msg) => {
			console.log('msg: ', msg)
			if (error && onSandpackError) {
				onSandpackError(error)
			}
			if (msg.type === 'dependencies') {
				setStatusMessage('📦 Installing dependencies...')
			} else if (msg.type === 'status') {
				if (msg.status === 'transpiling') {
					setStatusMessage('⚙️ Assembling your code...')
				} else if (msg.status === 'evaluating') {
					setStatusMessage('🚀 Your app is almost ready!')
				} else if (msg.status === 'idle' && !error) {
					setStatusMessage('')
				}
			} else if (msg.type === 'done' && msg.compilatonError === false) {
				onSuccess?.()
			}
		})
		return () => {
			stopListening()
		}
	}, [listen, statusMessage, error, status])

	const handleAutoFix = () => {
		if (error && onAutoFix) {
			setIsAutoFixInProgress(true)
			onAutoFix(error, () => {
				setIsAutoFixInProgress(false)
			})
		}
	}

	return (
		<div className="relative">
			<div className="flex items-center gap-4 py-2">{children}</div>
			<SandpackLayout>
				{!isPreviewOnly && (
					<SandpackCodeEditor
						style={{ height: 'calc(80vh - 10px)', width: '50%' }}
						showRunButton={false}
						showInlineErrors={true}
						wrapContent={true}
						showLineNumbers={true}
						showTabs={true}
						showReadOnly={true}
					/>
				)}
				<div
					className="relative"
					style={{
						height: 'calc(80vh - 10px)',
						width: isPreviewOnly ? '100%' : '50%',
					}}
				>
					<SandpackPreview
						style={{
							height: 'calc(80vh - 10px)',
							width: '100%',
						}}
						showRefreshButton={true}
						showNavigator={false}
						showRestartButton={true}
						showOpenInCodeSandbox={true}
						showOpenNewtab={false}
						showSandpackErrorOverlay={false}
					/>
					{statusMessage && (
						<div className="absolute inset-0 z-10 flex items-center justify-center" style={{ backgroundColor: '#1e2029' }}>
							<div className="flex flex-col items-center">
								<CircularProgress size={60} thickness={4} color="primary" />
								<p className="mt-2 text-lg font-semibold text-white">{statusMessage}</p>
							</div>
						</div>
					)}
				</div>
				{statusMessage === '' && actionButtons}
				{error && (
					<button
						onClick={handleAutoFix}
						className="sp-icon-standalone sp-c-bxeRRt sp-c-gMfcns sp-c-dEbKhQ sp-button absolute right-2 top-2 z-50 flex items-center gap-2 rounded-md px-3 py-1.5 font-semibold shadow-md transition-colors duration-200"
						title={`Automatically fix error: ${error.message}`}
						style={{
							backgroundColor: '#3b82f6', // Blue-600
							borderColor: '#3b82f6', // Blue-600
							color: 'white',
						}}
						disabled={isAutoFixInProgress}
					>
						{isAutoFixInProgress ? (
							<CircularProgress size={20} thickness={4} style={{ color: 'white' }} />
						) : (
							<ErrorOutlineIcon style={{ width: '16px', height: '16px' }} />
						)}
						<span>{isAutoFixInProgress ? 'Fixing...' : 'Auto Fix'}</span>
					</button>
				)}
			</SandpackLayout>
			{statusMessage !== '' && (
				<div className="absolute bottom-2 left-0 right-0 z-10 flex justify-center">
					<button
						onClick={onReset}
						className="sp-icon-standalone sp-c-bxeRRt sp-c-gMfcns sp-c-dEbKhQ sp-button flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2"
						title="Reset Sandbox"
					>
						<RefreshIcon style={{ width: '16px', height: '16px' }} />
					</button>
				</div>
			)}
			{/* {errorMessage && (
        <button
          onClick={handleFixIt}
          className={`flex items-center gap-2 absolute top-6 right-2 z-50 font-medium py-2 px-4 rounded-full transition-colors
            ${isFixButtonDisabled
              ? 'bg-blue-300 text-white cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          title="Fix Compilation Error"
          disabled={isFixButtonDisabled}
        >
          <ErrorOutlineIcon style={{ width: "16px", height: "16px" }} />
          <span>Auto Fix</span>
        </button>
      )} */}
		</div>
	)
}

export default function CodeEditor({ project, selectedArtifact, onAutoFix, onSandpackError, onSuccess, children }: CodeEditorProps) {
	const [key, setKey] = useState(0)

	const normalizedDependencies = useMemo(() => {
		const allDependencies = project.artifacts?.flatMap((artifact) => artifact.dependencies || []) || []
		return allDependencies.reduce(
			(acc, dep) => {
				acc[dep.name] = 'latest'
				return acc
			},
			{} as Record<string, string>
		)
	}, [project.artifacts])

	const sandpackFiles = useMemo(() => {
		const files: Record<string, { code: string; active: boolean; hidden: boolean; readOnly: boolean }> = {}

		// Add all project artifacts as files
		project.artifacts?.forEach((artifact) => {
			files[`/${artifact.name}.tsx`] = {
				code: artifact.code || '',
				active: artifact.id === selectedArtifact.id,
				hidden: artifact.id !== selectedArtifact.id,
				readOnly: false,
			}
		})

		// Add App.tsx with the selected artifact's code, but hidden
		files['/App.tsx'] = {
			code: selectedArtifact.code || '',
			active: false,
			hidden: true,
			readOnly: true,
		}

		return files
	}, [selectedArtifact.code, selectedArtifact.name, selectedArtifact.dependencies])

	const handleAutoFix = async (error: SandpackError, callback: () => void) => {
		onAutoFix?.(error, callback)
	}

	const handleReset = () => {
		setKey((prevKey) => prevKey + 1)
	}

	return (
		<div className="relative h-full w-full">
			<AnimatePresence>
				<SandpackProvider
					key={key}
					template="react-ts"
					options={{
						externalResources: ['https://unpkg.com/@tailwindcss/ui/dist/tailwind-ui.min.css'],
					}}
					theme={draculaTheme}
					customSetup={{
						dependencies: normalizedDependencies,
					}}
					files={sandpackFiles}
				>
					<SandpackContent
						onAutoFix={handleAutoFix}
						onSandpackError={onSandpackError}
						onReset={handleReset}
						onSuccess={onSuccess}
						selectedArtifact={selectedArtifact}
					>
						{children}
					</SandpackContent>
				</SandpackProvider>
			</AnimatePresence>
		</div>
	)
}
