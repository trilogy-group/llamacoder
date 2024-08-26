import Link from 'next/link';

interface PublishedAppLinkProps {
  url: string | null;
}

export default function PublishedAppLink({ url }: PublishedAppLinkProps) {
    if (!url) return null;
  
    return (
      <div className="mt-6 p-5 bg-green-50 border border-green-200 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-green-800 mb-3">Your App is Live!</h3>
        <div className="flex items-center justify-between">
          <Link 
            href={url}
            className="text-green-600 hover:text-green-800 text-base font-medium flex items-center group"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="truncate max-w-[300px]">{url}</span>
            <svg
              className="h-5 w-5 ml-2 group-hover:translate-x-0.5 transition-transform"
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
          className="text-sm px-3 py-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
        >
          Copy
        </button>
      </div>
    </div>
  );
}