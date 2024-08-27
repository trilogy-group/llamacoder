import Link from 'next/link';

interface PublishedAppLinkProps {
  url: string | null;
}

export default function PublishedAppLink({ url }: PublishedAppLinkProps) {
  const isPublished = !!url;
  
  return (
    <div className={`backdrop-blur-sm border rounded-lg shadow-md p-3 flex items-center space-x-3 ${
      isPublished ? 'bg-white/80 border-green-200' : 'bg-gray-100/80 border-gray-200'
    }`}>
      <div className="flex-shrink-0">
        <div className={`w-2 h-2 rounded-full ${
          isPublished ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
        }`}></div>
      </div>
      {isPublished ? (
        <Link 
          href={url!}
          className="text-sm text-green-700 hover:text-green-900 font-medium flex items-center group"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="truncate max-w-[200px]">Your App is Live</span>
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
      ) : (
        <span className="text-sm text-gray-600 font-medium">
          Publish your app to see it live
        </span>
      )}
    </div>
  );
}