import { LOGOUT_URL } from "@/utils/constants";
import { UserProfile } from "@auth0/nextjs-auth0/client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import logo from "../public/logo.png";

interface HeaderProps {
  user?: UserProfile;
}

export default function HeaderV2({ user }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <header className="fixed left-0 right-0 top-0 z-50 bg-gray-50 shadow-sm">
      <div className="w-full">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <button className="rounded-full p-1 text-gray-600 hover:bg-gray-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <Image src={logo} alt="Artifact Logo" width={24} height={24} />
            <h1 className="text-xl tracking-tight">
              Ar<span className="text-blue-600">TI</span>facts
            </h1>
          </div>
          <div className="flex items-center space-x-6">
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
                  <div className="absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className="px-4 py-2 text-sm text-gray-700">
                      {user.name}
                    </div>
                    <a
                      href={LOGOUT_URL}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Log out
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/" className="text-gray-600">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-sm font-semibold text-white`}
                >
                  A
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
