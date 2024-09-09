"use client";

import TypewriterEffect from "@/components/TypewriteEffect";
import { LOGIN_URL } from "@/utils/constants";
import { RocketLaunchIcon } from "@heroicons/react/24/solid";
import { ThemeProvider, createTheme } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import logo from "../../public/logo.png";

const theme = createTheme();

const LandingPage = () => {
  const router = useRouter();

  const handleTryItNow = () => {
    router.push(LOGIN_URL);
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center py-2">
        <div className="absolute right-4 top-4 space-x-4">
          <button className="transform rounded-full px-6 py-3 font-bold text-blue-600 transition duration-300 ease-in-out hover:scale-105 hover:bg-blue-100">
            Login
          </button>
          <button className="transform rounded-full bg-blue-600 px-6 py-3 font-bold text-white shadow-md transition duration-300 ease-in-out hover:scale-105 hover:bg-blue-700 hover:shadow-lg">
            Sign Up
          </button>
        </div>

        <main className="mt-12 flex w-full flex-1 flex-col items-center px-4 text-center sm:mt-20">
          <Image
            src={logo}
            alt="ArTIfacts Logo"
            width={100}
            height={100}
            className="mb-8 opacity-80 transition-opacity duration-300 hover:opacity-100"
          />
          <h1 className="my-6 max-w-3xl text-4xl font-bold text-gray-800 sm:text-6xl">
            Turn your <span className="text-blue-600">idea</span>
            <br /> into an Ar<span className="text-blue-600">TI</span>fact
          </h1>
          <TypewriterEffect
            text="Build, Preview and Make it Live 🚀 with a single click!"
            highlightWords={["Build", "Preview", "Live"]}
            className="mb-8 mt-8 text-2xl text-gray-600"
          />
          <div className="mt-10 flex space-x-6">
            <button
              className="flex transform items-center rounded-full bg-blue-600 px-8 py-4 text-lg font-bold text-white shadow-lg transition duration-300 ease-in-out hover:scale-105 hover:bg-blue-700 hover:shadow-xl"
              onClick={handleTryItNow}
            >
              <RocketLaunchIcon className="mr-2 h-6 w-6" />
              Try it now!
            </button>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default LandingPage;
