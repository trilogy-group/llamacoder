'use client'

import { useEffect, useState } from 'react'
import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'

export default function ApiDocs() {
	const [origin, setOrigin] = useState('')

	useEffect(() => {
		setOrigin(window.location.origin)
	}, [])

	if (!origin) {
		return null
	}

	return <SwaggerUI url="/api/docs" oauth2RedirectUrl={`${origin}/swagger`} displayRequestDuration />
}
