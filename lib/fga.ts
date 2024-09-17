import { WarrantOp, WorkOS } from '@workos-inc/node'
export const workos = new WorkOS(process.env.WORKOS_API_KEY)

import { CredentialsMethod, OpenFgaClient } from '@openfga/sdk'
export const fgaClient = new OpenFgaClient({
	apiUrl: process.env.FGA_API_URL,
	storeId: process.env.FGA_STORE_ID,
	authorizationModelId: process.env.FGA_MODEL_ID,
	credentials: {
		method: CredentialsMethod.ClientCredentials,
		config: {
			apiTokenIssuer: process.env.FGA_API_TOKEN_ISSUER || '',
			apiAudience: process.env.FGA_API_AUDIENCE || '',
			clientId: process.env.FGA_CLIENT_ID || '',
			clientSecret: process.env.FGA_CLIENT_SECRET || '',
		},
	},
})

interface FGAData {
	user: string // The user identifier in the format "user:<userId>"
	relation: string // The relation type, either "editor" or "viewer". During "check", the type can also be owner, can_share_as_viewer, can_share_as_editor, can_view, can_modify, can_delete
	object: string // The object identifier in the format "project:<projectId>"
}

export interface AccessData {
	allowed: boolean
}

/**
 * Utility function for handling Fine-Grained Authorization (FGA) operations.
 *
 * @param {string} action - The action to perform (share, delete, check)
 * @param {FGAData | FGAData[]} data - An object or array of objects representing relationships or query parameters
 * @returns {Promise<Object>} JSON response indicating success or failure
 */

export async function handleFGAOperation(action: string, data: FGAData | FGAData[]) {
	let response

	const formatWarrant = (item: FGAData) => ({
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
				return response

			case 'delete':
				// Remove relationships for all records in data
				// response = await fgaClient.write({ deletes: data })
				response = await workos.fga.batchWriteWarrants(formatted_data)
				return response

			case 'check':
				// Check access for all records in data. Response would be in allowed property for each object
				// response = await fgaClient.batchCheck(data)
				response = await workos.fga.checkBatch({ checks: formatted_data })
				return response.map((item) => ({ allowed: item.result === 'authorized' }))
			default:
				throw new Error('Invalid action')
		}
	} catch (error) {
		console.error(`Error in FGA ${action} operation:`, error)
		throw error
	}
}

/**
 * Lists users who have access to a specific project resource.
 *
 * @param {string} resourceId - The ID of the project resource to list users for.
 * @returns {Promise<Array>} A promise that resolves to an array of user data.
 * @throws {Error} If there's an error listing users via FGA.
 */
export async function listUsers(resourceId: string) {
	try {
		// List users for given object and relation
		// const response = await fgaClient.listUsers({
		// 	object: data.object,
		// 	user_filters: [{ type: 'user' }],
		// 	relation: data.relation,
		// })
		const response = await workos.fga.listWarrants({ resourceId: resourceId, subjectType: 'user', resourceType: 'project' })
		return response.data
	} catch (error) {
		console.error(`Error in listing Users via FGA:`, error)
		throw error
	}
}

/**
 * Lists projects accessible by provided user id.
 *
 * @param {string} subjectId - The ID of the user to list projects for.
 * @returns {Promise<Array>} A promise that resolves to an array of projects data.
 * @throws {Error} If there's an error listing users via FGA.
 */
export async function listProjects(subjectId: string) {
	try {
		// List users for given object and relation
		// const response = await fgaClient.listUsers({
		// 	object: data.object,
		// 	user_filters: [{ type: 'user' }],
		// 	relation: data.relation,
		// })
		const response = await workos.fga.listWarrants({ subjectId: subjectId, subjectType: 'user', resourceType: 'project' })
		return response.data
	} catch (error) {
		console.error(`Error in listing Projects via FGA:`, error)
		throw error
	}
}
