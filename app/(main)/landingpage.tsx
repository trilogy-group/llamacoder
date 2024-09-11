"use client";

import TypewriterEffect from "@/components/TypewriteEffect";
import { LOGIN_URL } from "@/utils/constants";
import { RocketLaunchIcon } from "@heroicons/react/24/solid";
import { ThemeProvider, createTheme } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import logo from "../../public/logo.png";
import { useState, useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { CircularProgress } from "@mui/material";

const theme = createTheme();

const LandingPage = () => {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleTryItNow = async () => {
    setIsLoggingIn(true);
    router.push(LOGIN_URL);
  };

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  return (
    <ThemeProvider theme={theme}>
      {
        isLoading ? (
          <div className="flex min-h-screen items-center justify-center">
        <CircularProgress size={60} />
      </div>
        ) : (
        <div className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center py-2">

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
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <CircularProgress size={24} color="inherit" className="mr-2" />
              ) : (
                <RocketLaunchIcon className="mr-2 h-6 w-6" />
              )}
              {isLoggingIn ? "Logging in..." : "Try it now!"}
            </button>
          </div>
        </main>
      </div>
        )
      }
    </ThemeProvider>
  );
};

export default LandingPage;
