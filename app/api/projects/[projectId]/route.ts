import { FileContext } from '@/types/FileContext'
import { Project } from '@/types/Project'
import { ddbClient } from '@/utils/ddbClient'
import { NextResponse } from 'next/server'
// @ts-ignore
import { AccessLevel } from '@/types/Project'
import { checkAccess, fetchContributors } from '@/utils/project'
import { getSession } from '@auth0/nextjs-auth0'

const TABLE_NAME = process.env.DDB_TABLE_NAME || 'ti-artifacts'

/**
 * @swagger
 * /api/projects/{projectId}:
 *   get:
 *     summary: Get a specific project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Project not found
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

		// Check if user has access to this project
		const { allowed, accessLevel } = await checkAccess(projectId, session.user)

		if (!allowed) {
			return NextResponse.json({ error: 'Access denied' }, { status: 403 })
		}

		console.log('projectId', projectId)

		// Fetch a single project by ID
		const result = await ddbClient.get(TABLE_NAME, { PK: `PROJECT#${projectId}`, SK: `PROJECT#${projectId}` })

		if (!result.Item) {
			return NextResponse.json({ error: 'Project not found' }, { status: 404 })
		}

		// Fetch contributors
		const contributors = await fetchContributors(projectId)

		const project: Project = {
			id: result.Item.id,
			title: result.Item.title,
			description: result.Item.description,
			thumbnail: result.Item.thumbnail,
			context: result.Item.context as FileContext[],
			entrypoint: result.Item.entrypoint,
			status: result.Item.status,
			createdAt: result.Item.createdAt,
			updatedAt: result.Item.updatedAt,
			createdBy: result.Item.createdBy,
			updatedBy: result.Item.updatedBy,
			publishedUrl: result.Item.publishedUrl,
			accessLevel: accessLevel as AccessLevel,
			contributors: contributors,
		}

		return NextResponse.json(project)
	} catch (error) {
		console.error('Error fetching project(s):', error)
		return NextResponse.json({ error: 'Failed to fetch project(s)' }, { status: 500 })
	}
}

/**
 * @swagger
 * /api/projects/{projectId}:
 *   put:
 *     summary: Update a project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProjectUpdateInput'
 *     responses:
 *       200:
 *         description: Project updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectResponse'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
export async function PUT(request: Request, { params }: { params: { projectId: string } }) {
	try {
		const session = await getSession()
		if (!session || !session.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}
		const { projectId } = params
		const body = await request.json()
		const { ...updateData } = body
		const now = new Date()

		// Check if user has access to modify this project
		const { allowed, accessLevel } = await checkAccess(projectId, session.user)
		if (!allowed || (accessLevel !== 'owner' && accessLevel !== 'editor')) {
			return NextResponse.json({ error: 'Access denied' }, { status: 403 })
		}

		const updateExpression =
			'SET ' +
			Object.keys(updateData)
				.map((key) => `#${key} = :${key}`)
				.join(', ') +
			', #updatedAt = :updatedAt, #updatedBy = :updatedBy'
		const expressionAttributeNames = {
			...Object.keys(updateData).reduce((acc, key) => ({ ...acc, [`#${key}`]: key }), {}),
			'#updatedAt': 'updatedAt',
			'#updatedBy': 'updatedBy',
		}
		const expressionAttributeValues = {
			...Object.entries(updateData).reduce((acc, [key, value]) => ({ ...acc, [`:${key}`]: value }), {}),
			':updatedAt': now.toISOString(),
			':updatedBy': session.user.email,
		}

		await ddbClient.update(
			TABLE_NAME,
			{ PK: `PROJECT#${projectId}`, SK: `PROJECT#${projectId}` },
			updateExpression,
			expressionAttributeValues,
			expressionAttributeNames
		)

		const result = await ddbClient.get(TABLE_NAME, { PK: `PROJECT#${projectId}`, SK: `PROJECT#${projectId}` })
		if (!result.Item) {
			return NextResponse.json({ error: 'Project not found' }, { status: 404 })
		}

		const updatedProject: Project = {
			id: result.Item.id,
			title: result.Item.title,
			description: result.Item.description,
			thumbnail: result.Item.thumbnail,
			context: result.Item.context as FileContext[],
			entrypoint: result.Item.entrypoint,
			status: result.Item.status,
			createdAt: result.Item.createdAt,
			updatedAt: result.Item.updatedAt,
			createdBy: result.Item.createdBy,
			updatedBy: result.Item.updatedBy,
			publishedUrl: result.Item.publishedUrl,
		}

		return NextResponse.json(updatedProject)
	} catch (error) {
		console.error('Error updating project:', error)
		return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
	}
}

/**
 * @swagger
 * /api/projects/{projectId}:
 *   delete:
 *     summary: Delete a project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteResponse'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
export async function DELETE(request: Request, { params }: { params: { projectId: string } }) {
	try {
		const session = await getSession()
		if (!session || !session.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { projectId } = params

		console.log('projectId', projectId)
		if (!projectId) {
			return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
		}

		// Check if user has access to delete this project
		const { allowed, accessLevel } = await checkAccess(projectId, session.user)
		if (!allowed || accessLevel !== 'owner') {
			return NextResponse.json({ error: 'Access denied' }, { status: 403 })
		}

		await ddbClient.delete(TABLE_NAME, { PK: `PROJECT#${projectId}`, SK: `PROJECT#${projectId}` })
		return NextResponse.json({ message: 'Project deleted successfully' })
	} catch (error) {
		console.error('Error deleting project:', error)
		return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
	}
}
