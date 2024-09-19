interface AddUserParams {
	email: string
	name?: string
}

export const userApi = {
	addUser: async ({ email, name }: AddUserParams) => {
		const response = await fetch('/api/users', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, name }),
		})
		if (!response.ok) throw new Error('Failed to add user')
		return await response.json()
	},
}
