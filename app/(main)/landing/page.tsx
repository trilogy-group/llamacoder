"use client";

import { GetStartedButton } from "@/components/AuthButtons";

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <h1 className="mb-4 text-4xl font-bold">Welcome to ArTIfacts</h1>
      <p className="mb-8 text-lg">This is the landing page.</p>
      <GetStartedButton />
    </div>
  );
}
