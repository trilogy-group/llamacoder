"use client";

import React, { useState, useEffect } from "react";
import {
  ThemeProvider,
  createTheme,
} from "@mui/material";
import Header from "@/components/Header";
import { RocketLaunchIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import TypewriterEffect from "@/components/TypewriteEffect";

const theme = createTheme();

const LandingPage = () => {
  return (
    <ThemeProvider theme={theme}>
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center py-2">
        <Header />
        
        <div className="absolute top-4 right-4 space-x-4">
          <button className="px-6 py-3 text-blue-600 font-bold rounded-full hover:bg-blue-100 transition duration-300 ease-in-out transform hover:scale-105">
            Login
          </button>
          <button className="px-6 py-3 bg-blue-600 text-white font-bold rounded-full shadow-md hover:bg-blue-700 hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105">
            Sign Up
          </button>
        </div>

        <main className="mt-12 flex w-full flex-1 flex-col items-center px-4 text-center sm:mt-20">
          <h1 className="my-6 max-w-3xl text-4xl font-bold text-gray-800 sm:text-6xl">
            Turn your <span className="text-blue-600">idea</span>
            <br /> into an Ar<span className="text-blue-600">TI</span>fact
          </h1>
          <TypewriterEffect
            text="Build, Preview and Make it Live 🚀 with a single click"
            highlightWords={["Build", "Preview", "Live"]}
            className="text-2xl text-gray-600 mb-8 mt-8"
          />
          <div className="mt-10 flex space-x-6">
            <button className="px-8 py-4 bg-blue-600 text-white text-lg font-bold rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl transform hover:scale-105 transition duration-300 ease-in-out flex items-center">
              <RocketLaunchIcon className="w-6 h-6 mr-2" />
              Try it now!
              <ChevronRightIcon className="w-5 h-5 ml-2" />
            </button>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default LandingPage;
