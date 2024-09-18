import swaggerJSDoc from 'swagger-jsdoc'

const options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'ArTIfacts API Documentation',
			version: '1.0.0',
		},
		security: [{ Auth0: [] }],
		components: {
			securitySchemes: {
				Auth0: {
					type: 'oauth2',
					description: 'Auth0 OAuth',
					flows: {
						implicit: {
							authorizationUrl: `${process.env.AUTH0_ISSUER_BASE_URL}/authorize`,
						},
					},
				},
			},
			schemas: {
				FileContext: {
					type: 'object',
					properties: {
						id: { type: 'string' },
						title: { type: 'string' },
						description: { type: 'string' },
						attachment: { $ref: '#/components/schemas/Attachment' },
					},
				},
				Attachment: {
					type: 'object',
					properties: {
						id: { type: 'string' },
						fileName: { type: 'string' },
						fileType: { type: 'string' },
						fileSize: { type: 'number' },
						url: { type: 'string' },
						createdAt: { type: 'string', format: 'date-time' },
						updatedAt: { type: 'string', format: 'date-time' },
						createdBy: { type: 'string' },
						updatedBy: { type: 'string' },
					},
				},
				Artifact: {
					type: 'object',
					properties: {
						id: { type: 'string' },
						name: { type: 'string' },
						displayName: { type: 'string' },
						description: { type: 'string' },
						projectId: { type: 'string' },
						status: {
							type: 'string',
							enum: ['idle', 'creating', 'updating', 'fixing', 'running', 'error', 'success', 'publishing'],
						},
						code: { type: 'string' },
						dependencies: {
							type: 'array',
							items: {
								type: 'object',
								properties: {
									name: { type: 'string' },
									version: { type: 'string' },
								},
							},
						},
						chatSession: { $ref: '#/components/schemas/ChatSession' },
						createdAt: { type: 'string', format: 'date-time' },
						updatedAt: { type: 'string', format: 'date-time' },
						error: { type: 'object' },
						publishedUrl: { type: 'string' },
					},
				},
				Contributor: {
					type: 'object',
					properties: {
						email: { type: 'string' },
						accessLevel: {
							type: 'string',
							enum: ['owner', 'editor', 'viewer'],
						},
					},
				},
				Project: {
					type: 'object',
					properties: {
						id: { type: 'string' },
						title: { type: 'string' },
						description: { type: 'string' },
						thumbnail: { type: 'string' },
						context: {
							type: 'array',
							items: { $ref: '#/components/schemas/FileContext' },
						},
						artifacts: {
							type: 'array',
							items: { $ref: '#/components/schemas/Artifact' },
						},
						entrypoint: { type: 'string' },
						status: { type: 'string' },
						createdAt: { type: 'string', format: 'date-time' },
						updatedAt: { type: 'string', format: 'date-time' },
						createdBy: { type: 'string' },
						updatedBy: { type: 'string' },
						publishedUrl: { type: 'string' },
						accessLevel: {
							type: 'string',
							enum: ['owner', 'editor', 'viewer'],
						},
						contributors: {
							type: 'array',
							items: { $ref: '#/components/schemas/Contributor' },
						},
					},
				},
				Job: {
					type: 'object',
					properties: {
						id: { type: 'string' },
						status: { type: 'string' },
						name: { type: 'string' },
						type: { type: 'string' },
						createdAt: { type: 'string', format: 'date-time' },
						updatedAt: { type: 'string', format: 'date-time' },
						resourceType: { type: 'string' },
						resourceId: { type: 'string' },
					},
				},
				ChatSession: {
					type: 'object',
					properties: {
						id: { type: 'string' },
						artifactId: { type: 'string' },
						messages: {
							type: 'array',
							items: { $ref: '#/components/schemas/Message' },
						},
						attachments: {
							type: 'array',
							items: { $ref: '#/components/schemas/Attachment' },
						},
						createdAt: { type: 'string', format: 'date-time' },
						updatedAt: { type: 'string', format: 'date-time' },
						user: { type: 'string' },
						model: { type: 'string' },
					},
				},
				Message: {
					type: 'object',
					properties: {
						role: {
							type: 'string',
							enum: ['user', 'assistant'],
						},
						text: { type: 'string' },
						attachments: {
							type: 'array',
							items: { $ref: '#/components/schemas/Attachment' },
						},
					},
				},
				ProjectInput: {
					type: 'object',
					properties: {
						title: { type: 'string', description: 'The title of the project' },
						description: { type: 'string', description: 'The description of the project' },
						thumbnail: { type: 'string', format: 'uri', description: 'The URL of the thumbnail image' },
					},
					required: ['title', 'description'],
				},
				ProjectUpdateInput: {
					type: 'object',
					properties: {
						title: { type: 'string', description: 'The title of the project' },
						description: { type: 'string', description: 'The description of the project' },
						thumbnail: { type: 'string', description: 'The URL of the thumbnail image' },
						status: { type: 'string', description: 'The status of the project' },
						publishedUrl: { type: 'string', description: 'The published URL of the project' },
					},
				},
				CreateProjectResponse: {
					type: 'object',
					properties: {
						id: { type: 'string' },
						title: { type: 'string' },
						description: { type: 'string' },
						thumbnail: { type: 'string', format: 'uri' },
						status: { type: 'string' },
						createdAt: { type: 'string', format: 'date-time' },
						updatedAt: { type: 'string', format: 'date-time' },
						createdBy: { type: 'string' },
						updatedBy: { type: 'string' },
						publishedUrl: { type: 'string' },
					},
				},
				UpdateProjectResponse: {
					type: 'object',
					properties: {
						id: { type: 'string' },
						title: { type: 'string' },
						description: { type: 'string' },
						thumbnail: { type: 'string', format: 'uri' },
						status: { type: 'string' },
						createdAt: { type: 'string', format: 'date-time' },
						updatedAt: { type: 'string', format: 'date-time' },
						createdBy: { type: 'string' },
						updatedBy: { type: 'string' },
						publishedUrl: { type: 'string' },
					},
				},
				DeleteResponse: {
					type: 'object',
					properties: {
						message: { type: 'string' },
					},
				},
				ProjectResponse: {
					type: 'object',
					properties: {
						id: { type: 'string' },
						title: { type: 'string' },
						description: { type: 'string' },
						thumbnail: { type: 'string', format: 'uri' },
						context: {
							type: 'array',
							items: { $ref: '#/components/schemas/FileContext' },
						},
						entrypoint: { type: 'string' },
						status: { type: 'string' },
						createdAt: { type: 'string', format: 'date-time' },
						updatedAt: { type: 'string', format: 'date-time' },
						createdBy: { type: 'string' },
						updatedBy: { type: 'string' },
						publishedUrl: { type: 'string' },
						accessLevel: {
							type: 'string',
							enum: ['owner', 'editor', 'viewer'],
						},
						contributors: {
							type: 'array',
							items: { $ref: '#/components/schemas/Contributor' },
						},
					},
				},
				ProjectsResponse: {
					type: 'array',
					items: { $ref: '#/components/schemas/ProjectResponse' },
				},
				CreateArtifactInput: {
					type: 'object',
					properties: {
						name: { type: 'string' },
						displayName: { type: 'string' },
						description: { type: 'string' },
						dependencies: {
							type: 'array',
							items: { type: 'object', properties: { name: { type: 'string' }, version: { type: 'string' } } },
						},
						code: { type: 'string' },
					},
				},
				ArtifactUpdateInput: {
					type: 'object',
					properties: {
						name: { type: 'string' },
						displayName: { type: 'string' },
						description: { type: 'string' },
						dependencies: { type: 'array', items: { type: 'string' } },
						status: { type: 'string' },
						code: { type: 'string' },
						error: { type: 'object' },
						publishedUrl: { type: 'string' },
					},
				},
			},
		},
	},
	apis: ['./app/api/**/*.ts'], // Path to the API docs
}

export const apiSpec = swaggerJSDoc(options)
