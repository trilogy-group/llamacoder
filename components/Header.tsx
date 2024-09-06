"use client";

import { UserProfile } from "@auth0/nextjs-auth0/client";
import Image from "next/image";
import Link from "next/link";
import logo from "../public/logo.png";
import { LogoutButton } from "./AuthButtons";

interface HeaderProps {
  user?: UserProfile;
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="relative mx-auto mt-5 flex w-full items-center justify-between px-2 pb-7 sm:px-4">
      <Link href="/" className="flex items-center gap-2">
        <Image alt="header text" src={logo} className="h-5 w-5" />
        <h1 className="text-xl tracking-tight">
          Ar<span className="text-blue-600">TI</span>facts
        </h1>
      </Link>

      <div className="flex-grow"></div>

      {user && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full bg-gray-300 p-2">
            <Image
              src={user.picture ?? ""}
              alt="User avatar"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="text-sm">{user.name}</span>
          </div>
          <LogoutButton />
        </div>
      )}
    </header>
  );
}
