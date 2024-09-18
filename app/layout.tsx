import { AppProvider } from '@/contexts/AppContext'
import { PHProvider } from '@/lib/posthog'
import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import './globals.css'

const PostHogPageView = dynamic(() => import('../lib/posthog'), {
	ssr: false,
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<PHProvider>
				<body>
					<PostHogPageView />
					<AppProvider>{children}</AppProvider>
				</body>
			</PHProvider>
		</html>
	)
}
