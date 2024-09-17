import { AccessData, handleFGAOperation, listUsers } from '@/lib/fga'
import { Contributor } from '@/types/Project'

export const fetchContributors = async (projectId: string) => {
	const response = await listUsers(projectId)
	return response.map((tuple) => ({ email: tuple.subject.resourceId, accessLevel: tuple.relation }) as Contributor)
}

export const checkAccess = async (projectId: string, user: any) => {
	const accessLevels = ['owner', 'editor', 'viewer']
	const userIds = [user.sub, user.email]
	const checkCombinations = accessLevels.flatMap((level) =>
		userIds.map((id) => ({
			user: `user:${id}`,
			relation: level,
			object: `project:${projectId}`,
		}))
	)

	const batchCheckResponse = (await handleFGAOperation('check', checkCombinations)) as AccessData[]

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
