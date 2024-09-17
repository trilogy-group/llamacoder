import { Artifact } from '@/types/Artifact'
import { ddbClient } from '@/utils/ddbClient'
import { NextResponse } from 'next/server'
// @ts-ignore
import { checkAccess } from '@/utils/project'
import { getSession } from '@auth0/nextjs-auth0'

const TABLE_NAME = process.env.DDB_TABLE_NAME || 'ti-artifacts'

// Read an artifact by ID
export async function GET(request: Request, { params }: { params: { projectId: string; artifactId: string } }) {
	try {
		const session = await getSession()
		if (!session || !session.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { projectId, artifactId } = params

		// Check if user has access to view this project
		const { allowed, accessLevel } = await checkAccess(projectId, session.user)
		if (!allowed) {
			return NextResponse.json({ error: 'Access denied' }, { status: 403 })
		}

		// Fetch the artifact
		const result = await ddbClient.get(TABLE_NAME, { PK: `PROJECT#${projectId}`, SK: `ARTIFACT#${artifactId}` })

		if (!result.Item) {
			return NextResponse.json({ error: 'Artifact not found' }, { status: 404 })
		}

		return NextResponse.json(result.Item as Artifact)
	} catch (error) {
		console.error('Error fetching artifact:', error)
		return NextResponse.json({ error: 'Failed to fetch artifact' }, { status: 500 })
	}
}

// Update an artifact
export async function PUT(request: Request, { params }: { params: { projectId: string; artifactId: string } }) {
	try {
		const session = await getSession()
		if (!session || !session.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { projectId, artifactId } = params
		const updateData = await request.json()
		const now = new Date().toISOString()

		// Check if user has access to modify artifacts in this project
		const { allowed, accessLevel } = await checkAccess(projectId, session.user)
		if (!allowed || (accessLevel !== 'owner' && accessLevel !== 'editor')) {
			return NextResponse.json({ error: 'Access denied' }, { status: 403 })
		}

		// Prepare update expression and attribute values
		const updateExpression =
			'SET ' +
			Object.keys(updateData)
				.map((key) => `#${key} = :${key}`)
				.join(', ') +
			', #updatedAt = :updatedAt'
		const expressionAttributeValues = Object.entries(updateData).reduce(
			(acc, [key, value]) => {
				acc[`:${key}`] = value
				return acc
			},
			{ ':updatedAt': now } as Record<string, any>
		)
		const expressionAttributeNames = Object.keys(updateData).reduce(
			(acc, key) => {
				acc[`#${key}`] = key
				return acc
			},
			{ '#updatedAt': 'updatedAt' } as Record<string, string>
		)

		// Update the artifact
		await ddbClient.update(
			TABLE_NAME,
			{ PK: `PROJECT#${projectId}`, SK: `ARTIFACT#${artifactId}` },
			updateExpression,
			expressionAttributeValues,
			expressionAttributeNames
		)

		// Fetch the updated artifact
		const result = await ddbClient.get(TABLE_NAME, { PK: `PROJECT#${projectId}`, SK: `ARTIFACT#${artifactId}` })

		if (!result.Item) {
			return NextResponse.json({ error: 'Failed to retrieve updated artifact' }, { status: 500 })
		}

		// Ensure the response is JSON serializable
		const updatedArtifact = JSON.parse(JSON.stringify(result.Item))
		return NextResponse.json(updatedArtifact)
	} catch (error) {
		console.error('Error updating artifact:', error)
		return NextResponse.json({ error: 'Failed to update artifact' }, { status: 500 })
	}
}

// Delete an artifact
export async function DELETE(request: Request, { params }: { params: { projectId: string; artifactId: string } }) {
	try {
		const session = await getSession()
		if (!session || !session.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { projectId, artifactId } = params

		// Check if user has access to delete artifacts in this project
		const { allowed, accessLevel } = await checkAccess(projectId, session.user)
		if (!allowed || accessLevel !== 'owner') {
			return NextResponse.json({ error: 'Access denied' }, { status: 403 })
		}

		await ddbClient.delete(TABLE_NAME, { PK: `PROJECT#${projectId}`, SK: `ARTIFACT#${artifactId}` })

		return NextResponse.json({ message: 'Artifact deleted successfully' })
	} catch (error) {
		console.error('Error deleting artifact:', error)
		return NextResponse.json({ error: 'Failed to delete artifact' }, { status: 500 })
	}
}
