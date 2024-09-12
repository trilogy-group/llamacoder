import React, { ReactNode, useState } from 'react'

interface RenameDialogProps {
	message: ReactNode
	onConfirm: () => Promise<string | void>
	onCancel: () => void
}

const RenameDialog: React.FC<RenameDialogProps> = ({ message, onConfirm, onCancel }) => {
	const [isConfirming, setIsConfirming] = useState(false)
	const [result, setResult] = useState<string | null>(null)

	const handleConfirm = async () => {
		setIsConfirming(true)
		try {
			const resultMessage = await onConfirm()
			setResult(typeof resultMessage === 'string' ? resultMessage : 'Action completed successfully')
		} catch (error) {
			setResult(error instanceof Error ? error.message : 'An error occurred')
		} finally {
			setIsConfirming(false)
		}
	}

	return (
		<div className="w-full max-w-lg rounded-2xl bg-gray-100 p-6 shadow-lg">
			<h2 className="mb-6 text-2xl font-bold text-gray-800">Rename Artifact</h2>
			<div className="mb-6 text-gray-600">{message}</div>
			{result ? (
				<div className="mb-6 text-center">
					<p className={`text-lg ${result.includes('error') ? 'text-red-600' : 'text-green-600'}`}>{result}</p>
				</div>
			) : (
				<div className="flex justify-end space-x-3">
					<button
						onClick={onCancel}
						className="rounded-full bg-gray-200 px-6 py-2 text-sm font-medium text-gray-600 transition duration-300 ease-in-out hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
						disabled={isConfirming}
					>
						Cancel
					</button>
					<button
						onClick={handleConfirm}
						className={`relative flex items-center justify-center rounded-full px-6 py-2 text-sm font-medium text-white transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
							isConfirming ? 'cursor-not-allowed bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'
						}`}
						disabled={isConfirming}
					>
						{isConfirming ? (
							<>
								<span className="opacity-0">Rename</span>
								<div className="absolute inset-0 flex items-center justify-center">
									<div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
								</div>
							</>
						) : (
							'Rename'
						)}
					</button>
				</div>
			)}
		</div>
	)
}

export default RenameDialog
