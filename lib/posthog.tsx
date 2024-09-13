'use client'

import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import React from 'react'

import { usePathname, useSearchParams } from 'next/navigation'
import { usePostHog } from 'posthog-js/react'
import { useEffect } from 'react'

// Add this in useEffect in PHProvider in case of hydration issues
if (typeof window !== 'undefined') {
	posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
		api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
		person_profiles: 'identified_only',
		capture_pageview: false, // Disable automatic pageview capture, as we capture manually
		capture_pageleave: true,
	})
}

export function PHProvider({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
			api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
			person_profiles: 'identified_only',
			capture_pageleave: true,
			// capture_pageview: false, // Disable automatic pageview capture, as we capture manually
			// loaded: (posthog) => {
			// 	if (process.env.NODE_ENV === 'development') posthog.debug() // debug mode in development
			// },
		})

		return () => {}
	}, [])

	return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}

export default function PostHogPageView(): null {
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const posthog = usePostHog()

	// if (location.hostname === "localhost") posthog.opt_out_capturing()

	useEffect(() => {
		// Track pageviews
		if (pathname && posthog) {
			let url = window.origin + pathname
			if (searchParams.toString()) {
				url = url + `?${searchParams.toString()}`
			}
			posthog.capture('$pageview', {
				$current_url: url,
			})
		}
	}, [pathname, searchParams, posthog])

	return null
}
