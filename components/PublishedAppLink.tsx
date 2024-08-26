import Link from 'next/link';

interface PublishedAppLinkProps {
  url: string | null;
}

export default function PublishedAppLink({ url }: PublishedAppLinkProps) {
  if (!url) return null;

  return (
    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md shadow-sm">
      <h3 className="text-sm font-semibold text-green-800 mb-2">Your App is Live!</h3>
      <div className="flex items-center justify-between">
        <Link 
          href={url}
          className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center group"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="truncate max-w-[200px]">{url}</span>
          <svg
            className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </Link>
        <button
          onClick={() => navigator.clipboard.writeText(url)}
          className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
        >
          Copy
        </button>
      </div>
    </div>
  );
}