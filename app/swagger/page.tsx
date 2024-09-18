'use client'

import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'

export default function ApiDocs() {
	return <SwaggerUI url="/api/docs" oauth2RedirectUrl={`${window.location.origin}/swagger`} displayRequestDuration />
}
