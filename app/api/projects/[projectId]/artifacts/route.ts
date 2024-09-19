import { Artifact } from '@/types/Artifact'
import { ddbClient } from '@/utils/ddbClient'
import { NextResponse } from 'next/server'
// @ts-ignore
import { checkAccess } from '@/utils/project'
import { getSession } from '@auth0/nextjs-auth0'
import { v4 as uuidv4 } from 'uuid'

const TABLE_NAME = process.env.DDB_TABLE_NAME || 'ti-artifacts'

/**
 * @swagger
 * /api/projects/{projectId}/artifacts:
 *   get:
 *     summary: Get all artifacts for a project
 *     tags: [Artifacts]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Artifact'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/projects/{projectId}/artifacts:
 *   post:
 *     summary: Create a new artifact
 *     tags: [Artifacts]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateArtifactInput'
 *     responses:
 *       201:
 *         description: Artifact created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Artifact'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
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
			id: body.id || uuidv4(),
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
