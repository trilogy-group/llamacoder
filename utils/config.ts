export const defaultDependencies = [
    {
      name: "lucide-react",
      version: "latest",
    },
    {
      name: "recharts",
      version: "latest",
    },
    {
      name: "axios",
      version: "latest",
    },
    {
      name: "react-dom",
      version: "latest",
    },
    {
      name: "react-router-dom",
      version: "latest",
    },
    {
      name: "react-ui",
      version: "latest",
    },
    {
      name: "@mui/material",
      version: "latest",
    },
    {
      name: "@mui/styles",
      version: "latest",
    },
    {
      name: "@emotion/react",
      version: "latest",
    },
    {
      name: "@emotion/styled",
      version: "latest",
    },
    {
      name: "@mui/icons-material",
      version: "latest",
    },
    {
      name: "react-player",
      version: "latest",
    },
  ];
  

export const defaultCode = `import React, { useState, useEffect } from 'react';

const DefaultApp = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
      <div className="text-center p-8 bg-white rounded-lg shadow-xl">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to TIArtifacts 👋
        </h1>
        {isLoading ? (
          <p className="text-lg text-gray-600">Please wait while we get your app ready...</p>
        ) : (
          <p className="text-lg text-gray-600">Your app is ready! Enjoy!</p>
        )}
      </div>
    </div>
  );
};

export default DefaultApp;`