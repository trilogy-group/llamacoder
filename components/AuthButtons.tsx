import { PlayIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import React from "react";
import { LOGIN_URL, LOGOUT_URL } from "../utils/constants";

export const GetStartedButton: React.FC = () => {
  return (
    <Link href={LOGIN_URL} passHref>
      <button className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-white shadow-md transition-all hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
        <span className="relative">
          <PlayIcon className="h-5 w-5 text-white" />
        </span>
        <span className="font-medium">Get Started</span>
      </button>
    </Link>
  );
};

export const LogoutButton: React.FC = () => {
  return (
    <Link href={LOGOUT_URL} passHref>
      <button className="inline-flex items-center justify-center gap-2 rounded-full bg-red-500 px-4 py-2 text-white shadow-md transition-all hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
        <span className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
            />
          </svg>
        </span>
        <span className="font-medium">Logout</span>
      </button>
    </Link>
  );
};
