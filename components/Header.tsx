import Image from "next/image";
import Link from "next/link";
import logo from "../public/logo.png";
import GithubIcon from "./github-icon";

export default function Header() {
  return (
    <header className="relative mx-auto mt-5 flex w-full items-center justify-center px-2 pb-7 sm:px-4">
      <Link href="/" className="absolute flex items-center gap-2">
        <Image alt="header text" src={logo} className="h-5 w-5" />
        <h1 className="text-xl tracking-tight">
          Ar<span className="text-blue-600">TI</span>facts
        </h1>
      </Link>

    </header>
  );
}
