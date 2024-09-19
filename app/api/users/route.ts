import { addUser } from '@/lib/fga'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
	try {
		const { name, email } = await request.json()

		if (!email) {
			return NextResponse.json({ error: 'Missing required email' }, { status: 400 })
		}

		const metadata = name ? { name } : {}
		const response = await addUser(email, metadata)
		return NextResponse.json(response)
	} catch (error) {
		console.error('Error adding user:', error)
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
	}
}
