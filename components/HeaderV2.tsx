import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import logo from "../public/logo.png";

const HeaderV2: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-50 shadow-sm">
      <div className="w-full">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:bg-gray-200 p-1 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Image src={logo} alt="Loom Logo" width={24} height={24} />
            <h1 className="text-lg font-normal text-gray-800">Library | Loom - 3 September 2024</h1>
          </div>
          <div className="flex items-center space-x-6">
            <button className="text-gray-600 hover:bg-gray-200 p-2 rounded-full relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            <Link href="/" className="text-gray-600">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">A</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderV2;