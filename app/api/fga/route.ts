import workos from '@/lib/workosFGA'
import { WarrantOp, WriteWarrantOptions } from '@workos-inc/node'
import { NextResponse } from 'next/server'

/**
 * FGA API endpoint. Usage documentation: https://docs.fga.dev/integration/update-tuples
 *
 * This API handles Fine-Grained Authorization (FGA) operations.
 * It supports five actions: share, delete, check, listObjects, and listUsers.
 *
 * @route POST /api/fga
 * @param {Object} req - The request object
 * @param {string} req.body.action - The action to perform (share, delete, check, listObjects, or listUsers)
 * @param {Array<Object> | Object} req.body.data - An object or array of objects representing relationships or query parameters
 *   @param {string} req.body.data[].user - The user identifier in the format "user:<userId>"
 *   @param {string} req.body.data[].relation - The relation type, either "editor" or "viewer". During "check", the type can also be owner, can_share_as_viewer, can_share_as_editor, can_view, can_modify, can_delete
 *   @param {string} req.body.data[].object - The object identifier in the format "project:<projectId>"
 * @returns {Object} JSON response indicating success or failure
 */
export async function POST(req: Request) {
	const { action, data } = await req.json()
	let response

	const formatWarrant = (item: any): WriteWarrantOptions => ({
		resource: {
			resourceType: 'project',
			resourceId: item.object.split(':')[1].toString(),
		},
		relation: item.relation,
		subject: {
			resourceType: 'user',
			resourceId: item.user.split(':')[1].toString(),
		},
		op: action === 'share' ? WarrantOp.Create : action === 'delete' ? WarrantOp.Delete : undefined,
	})

	const formatted_data = Array.isArray(data) ? data.map(formatWarrant) : [formatWarrant(data)]
	try {
		switch (action) {
			case 'share':
				// Add relationships for all records in data
				// response = await fgaClient.write({ writes: data })
				response = await workos.fga.batchWriteWarrants(formatted_data)
				return NextResponse.json(response)

			case 'delete':
				// Remove relationships for all records in data
				// response = await fgaClient.write({ deletes: data })
				response = await workos.fga.batchWriteWarrants(formatted_data)
				return NextResponse.json(response)

			case 'check':
				// Check access for all records in data. Response would be in allowed property for each object
				// response = await fgaClient.batchCheck(data)
				response = await workos.fga.checkBatch({ checks: formatted_data })
				const mappedResponse = response.map((item) => ({ allowed: item.result === 'authorized' }))
				return NextResponse.json(mappedResponse)

			case 'listObjects':
				// List projects for given user and relation
				// response = await fgaClient.listObjects({
				// 	user: data.user,
				// 	relation: data.relation,
				// 	type: 'project',
				// })
				response = await workos.fga.listWarrants({
					// @ts-ignore
					subjectId: formatted_data[0].subject.resourceId,
					subjectType: 'user',
					resourceType: 'project',
				})
				return NextResponse.json(response.data)

			case 'listUsers':
				// List users for given object and relation
				// response = await fgaClient.listUsers({
				// 	object: data.object,
				// 	user_filters: [{ type: 'user' }],
				// 	relation: data.relation,
				// })
				response = await workos.fga.listWarrants({
					// @ts-ignore
					resourceId: formatted_data[0].resource.resourceId,
					subjectType: 'user',
					resourceType: 'project',
				})
				return NextResponse.json(response.data)

			default:
				return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
		}
	} catch (error) {
		console.error('Error in FGA operation:', error)
		return NextResponse.json({ error: 'Failed to perform FGA operation' }, { status: 500 })
	}
}
