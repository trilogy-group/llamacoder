import React from "react";
import Image from "next/image";
import Link from "next/link";
import logo from "../public/logo.png";

const HeaderV2: React.FC = () => {

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
            <button className="relative rounded-full p-2 text-gray-600 hover:bg-gray-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
            </button>
            <Link href="/" className="text-gray-600">
              <span className={`bg-green-600 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white`}>
                A
              </span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderV2;
