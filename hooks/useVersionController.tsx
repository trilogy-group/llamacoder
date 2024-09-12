import { useCallback, useState } from 'react'

export interface VersionController {
	totalVersions: number
	currentVersion: number
	goToNextVersion: () => void
	goToPreviousVersion: () => void
	updateTotalVersions: (total: number) => void
}

export const useVersionController = (initialTotal: number): VersionController => {
	const [totalVersions, setTotalVersions] = useState(initialTotal)
	const [currentVersion, setCurrentVersion] = useState(initialTotal)

	const goToNextVersion = useCallback(() => {
		setCurrentVersion((prev) => Math.min(prev + 1, totalVersions))
	}, [totalVersions])

	const goToPreviousVersion = useCallback(() => {
		setCurrentVersion((prev) => Math.max(prev - 1, 1))
	}, [])

	const updateTotalVersions = useCallback((newTotal: number) => {
		setTotalVersions(newTotal)
		setCurrentVersion(newTotal)
	}, [])

	return {
		totalVersions,
		currentVersion,
		goToNextVersion,
		goToPreviousVersion,
		updateTotalVersions,
	}
}
