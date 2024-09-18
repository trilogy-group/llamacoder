import { AccessData, handleFGAOperation, listUsers } from '@/lib/fga'
import { Contributor } from '@/types/Project'

export const fetchContributors = async (projectId: string) => {
	const response = await listUsers(projectId)
	return response.map((tuple) => ({ email: tuple.subject.resourceId, accessLevel: tuple.relation }) as Contributor)
}

export const checkAccess = async (projectId: string, user: any) => {
	const accessLevels = ['owner', 'editor', 'viewer']
	const batchCheckResponse = (await handleFGAOperation(
		'check',
		accessLevels.map((level) => ({
			user: `user:${user.sub}`,
			relation: level,
			object: `project:${projectId}`,
		}))
	)) as AccessData[]

	let allowed = false
	let accessLevel = 'none'
	for (let idx = 0; idx < batchCheckResponse.length; idx++) {
		if (batchCheckResponse[idx].allowed) {
			allowed = true
			accessLevel = accessLevels[idx]
			break
		}
	}

	return { allowed, accessLevel }
}
