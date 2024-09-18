import { Artifact } from './Artifact'
import { FileContext } from './FileContext'

export type AccessLevel = 'owner' | 'editor' | 'viewer'

export interface Contributor {
	name?: string
	email: string
	accessLevel: AccessLevel
}

export interface Project {
	id: string
	title: string
	description: string
	thumbnail?: string
	context?: FileContext[]
	artifacts?: Artifact[]
	entrypoint?: string
	status: string
	createdAt: string
	updatedAt: string
	createdBy?: string | null | undefined
	updatedBy?: string | null | undefined
	publishedUrl?: string
	accessLevel?: AccessLevel
	contributors?: Contributor[]
}
