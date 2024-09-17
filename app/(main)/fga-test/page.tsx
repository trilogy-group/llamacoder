'use client'

import { useState } from 'react'
import { toast } from 'sonner'

interface FGAData {
	user?: string
	relation?: string
	object?: string | { type: string; id: string }
}

interface FGARequest {
	action: 'share' | 'delete' | 'check' | 'listObjects' | 'listUsers'
	data: Array<FGAData> | FGAData
}

export default function FGAInterface() {
	const [action, setAction] = useState<FGARequest['action']>('share')
	const [user, setUser] = useState('')
	const [relation, setRelation] = useState('')
	const [object, setObject] = useState('')
	const [result, setResult] = useState<string>('')

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		const request: FGARequest = {
			action,
			data: [{ user, relation, object }],
		}
		if (!(action in ['share', 'check', 'delete'])) request.data = { user, relation, object }

		try {
			const response = await fetch('/api/fga', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(request),
			})

			if (!response.ok) throw new Error('Failed to fetch')

			const data = await response.json()
			setResult(JSON.stringify(data, null, 2))
			toast.success('FGA operation successful')
		} catch (error) {
			console.error('Error:', error)
			toast.error('Failed to perform FGA operation')
		}
	}

	return (
		<div className="p-4">
			<h1 className="mb-4 text-2xl font-bold">FGA API Interface</h1>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label className="mb-1 block">Action:</label>
					<select value={action} onChange={(e) => setAction(e.target.value as FGARequest['action'])} className="w-full rounded border p-2">
						<option value="share">Share</option>
						<option value="delete">Delete</option>
						<option value="check">Check</option>
						<option value="listObjects">List Objects</option>
						<option value="listUsers">List Users</option>
					</select>
				</div>
				<div>
					<label className="mb-1 block">User:</label>
					<input
						type="text"
						value={user}
						onChange={(e) => setUser(e.target.value)}
						placeholder="user:<userId>"
						className="w-full rounded border p-2"
					/>
				</div>
				<div>
					<label className="mb-1 block">Relation:</label>
					<input
						type="text"
						value={relation}
						onChange={(e) => setRelation(e.target.value)}
						placeholder="editor or viewer"
						className="w-full rounded border p-2"
					/>
				</div>
				<div>
					<label className="mb-1 block">Object:</label>
					<input
						type="text"
						value={object}
						onChange={(e) => setObject(e.target.value)}
						placeholder="project:<projectId>"
						className="w-full rounded border p-2"
					/>
				</div>
				<button type="submit" className="rounded bg-blue-500 p-2 text-white">
					Execute FGA Operation
				</button>
			</form>
			{result && (
				<div className="mt-4">
					<h2 className="mb-2 text-xl font-bold">Result:</h2>
					<pre className="overflow-x-auto rounded bg-gray-100 p-4">{result}</pre>
				</div>
			)}
		</div>
	)
}
