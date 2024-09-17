import { Artifact } from '@/types/Artifact'
import { ddbClient } from '@/utils/ddbClient'
import { NextResponse } from 'next/server'
// @ts-ignore
import { checkAccess } from '@/utils/project'
import { getSession } from '@auth0/nextjs-auth0'

const TABLE_NAME = process.env.DDB_TABLE_NAME || 'ti-artifacts'

// Get all artifacts for a project
export async function GET(request: Request, { params }: { params: { projectId: string } }) {
	try {
		const session = await getSession()
		if (!session || !session.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { projectId } = params

		// Check if user has access to view this project
		const { allowed, accessLevel } = await checkAccess(projectId, session.user)
		if (!allowed) {
			return NextResponse.json({ error: 'Access denied' }, { status: 403 })
		}

		// Fetch all artifacts for the project
		const result = await ddbClient.query(TABLE_NAME, {
			KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
			ExpressionAttributeValues: {
				':pk': `PROJECT#${projectId}`,
				':sk': 'ARTIFACT#',
			},
		})

		return NextResponse.json(result.Items as Artifact[])
	} catch (error) {
		console.error('Error fetching artifacts:', error)
		return NextResponse.json({ error: 'Failed to fetch artifacts' }, { status: 500 })
	}
}

// Create a new artifact
export async function POST(request: Request, { params }: { params: { projectId: string } }) {
	try {
		const session = await getSession()
		if (!session || !session.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { projectId } = params
		const body: Omit<Artifact, 'createdAt' | 'updatedAt'> = await request.json()
		const now = new Date().toISOString()
		const artifact: Artifact = {
			...body,
			projectId,
			createdAt: now,
			updatedAt: now,
		}

		// Check if user has access to create artifacts in this project
		const { allowed, accessLevel } = await checkAccess(projectId, session.user)
		if (!allowed || (accessLevel !== 'owner' && accessLevel !== 'editor')) {
			return NextResponse.json({ error: 'Access denied' }, { status: 403 })
		}

		await ddbClient.put(TABLE_NAME, {
			...artifact,
			PK: `PROJECT#${projectId}`,
			SK: `ARTIFACT#${artifact.id}`,
		})

		return NextResponse.json(artifact, { status: 201 })
	} catch (error) {
		console.error('Error creating artifact:', error)
		return NextResponse.json({ error: 'Failed to create artifact' }, { status: 500 })
	}
}
