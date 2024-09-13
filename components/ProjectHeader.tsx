import { LOGOUT_URL } from "@/utils/constants";
import { UserProfile } from "@auth0/nextjs-auth0/client";
import Image from "next/image";
import Link from "next/link";
import { useState, useCallback, useRef, useEffect } from "react";
import { FiLogOut, FiUser, FiLink, FiMoreHorizontal, FiCalendar, FiInfo, FiExternalLink, FiCpu } from "react-icons/fi";
import { HiUserGroup } from "react-icons/hi";
import logo from "../public/logo.png";
import { Project } from "@/types/Project";
import { formatDistanceToNow } from 'date-fns';
import { FiArrowLeft } from "react-icons/fi";
import Tooltip from './Tooltip';

interface HeaderProps {
  user?: UserProfile;
  project: Project;
  onDashboardClick: () => void;
  onShare: () => void;  // Add this line
}

export default function ProjectHeader({ user, project, onDashboardClick, onShare }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showProjectInfo, setShowProjectInfo] = useState(false);
  const infoButtonRef = useRef<HTMLButtonElement>(null);
  const infoCardRef = useRef<HTMLDivElement>(null);

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    window.location.href = LOGOUT_URL;
  }, []);

  const timeAgo = formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleDashboardClick = () => {
    onDashboardClick(); // Call the passed function instead of using router
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (infoCardRef.current && !infoCardRef.current.contains(event.target as Node) &&
          infoButtonRef.current && !infoButtonRef.current.contains(event.target as Node)) {
        setShowProjectInfo(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 bg-white shadow-sm">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center">
            <div className="w-10 h-10 flex-shrink-0 bg-blue-100 rounded-lg overflow-hidden mr-3">
              <Image src={logo} alt="Artifact Logo" width={40} height={40} />
            </div>
            <div className="flex-grow min-w-0">
              <div className="flex items-center">
                <Tooltip content="Go to Dashboard">
                  <button
                    onClick={handleDashboardClick}
                    className="mr-2 p-1 rounded-full hover:bg-gray-100 transition duration-300 ease-in-out"
                  >
                    <FiArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                </Tooltip>
                <div>
                  <h1 className="text-xl font-semibold text-gray-800 truncate mr-2">
                    {project.title}
                  </h1>
                  <div className="flex items-center text-xs text-gray-400">
                    <FiCalendar className="w-3 h-3 mr-1" />
                    <span>
                      {project.updatedBy ? `${project.updatedBy} · ` : ''}
                      {timeAgo}
                    </span>
                  </div>
                </div>
                <button
                  ref={infoButtonRef}
                  onClick={() => setShowProjectInfo(!showProjectInfo)}
                  className="text-gray-400 hover:text-gray-600 relative ml-2"
                >
                  <FiInfo className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex rounded-full overflow-hidden bg-blue-500 text-white text-sm font-medium">
              <button 
                className="flex items-center space-x-2 px-4 py-2 hover:bg-blue-600 transition duration-300 ease-in-out"
                onClick={onShare}  // Add this line
              >
                <HiUserGroup className="h-5 w-5" />
                <span>Share</span>
              </button>
              <button className="flex items-center px-3 py-2 border-l border-blue-400 hover:bg-blue-600 transition duration-300 ease-in-out">
                <FiLink className="h-5 w-5" />
              </button>
            </div>
            <button className="p-2 rounded-full hover:bg-gray-100 transition duration-300 ease-in-out">
              <FiMoreHorizontal className="h-5 w-5 text-gray-600" />
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center focus:outline-none"
                >
                  <Image
                    src={user.picture ?? ""}
                    alt={user.name || "A"}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                </button>
                {isOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className="border-b border-gray-200 px-4 py-2">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 transition duration-150 ease-in-out hover:bg-gray-100"
                        disabled={isLoggingOut}
                      >
                        {isLoggingOut ? (
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-t-transparent"></div>
                        ) : (
                          <FiLogOut className="mr-2 h-4 w-4 text-gray-500" />
                        )}
                        {isLoggingOut ? "Logging out..." : "Log out"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/" className="text-gray-600">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-sm font-semibold text-white">
                  <FiUser className="h-4 w-4" />
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {showProjectInfo && (
        <div
          ref={infoCardRef}
          className="absolute z-50 w-80 bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-4 transition-all duration-300 hover:shadow-xl"
          style={{
            top: infoButtonRef.current ? infoButtonRef.current.offsetTop + infoButtonRef.current.offsetHeight + 8 : 0,
            left: infoButtonRef.current ? infoButtonRef.current.offsetLeft : 0,
          }}
        >
          <div className="flex items-center mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg overflow-hidden mr-3">
              <Image src={logo} alt="Project logo" width={48} height={48} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{project.title}</h3>
              <p className="text-xs text-gray-500">ID: {project.id.slice(0, 8)}</p>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-3">{project.description || "No description available"}</p>
          
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              project.status === 'Active' ? 'bg-green-100 text-green-800' :
              project.status === 'Inactive' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {project.status}
            </span>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex items-center">
              <FiCpu className="w-4 h-4 mr-2" />
              <span>Created by: {project.createdBy}</span>
            </div>
            <div className="flex items-center">
              <FiCalendar className="w-4 h-4 mr-2" />
              <span>Created: {formatDate(project.createdAt)}</span>
            </div>
            <div className="flex items-center">
              <FiCalendar className="w-4 h-4 mr-2" />
              <span>Updated: {formatDate(project.updatedAt)}</span>
            </div>
          </div>

          {project.status === 'Active' && project.publishedUrl && (
            <div className="mt-4">
              <a
                href={project.publishedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-500 hover:text-green-600 transition duration-300 ease-in-out inline-flex items-center"
              >
                <FiExternalLink className="w-4 h-4 mr-1" />
                <span className="text-sm">View Live</span>
              </a>
            </div>
          )}
        </div>
      )}
    </header>
  );
}