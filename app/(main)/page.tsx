"use client";

import { usePathname } from "next/navigation";
import Dashboard from "./dashboard";
import LandingPage from "./landingpage";

export default function Home() {
  const pathname = usePathname();

  return (
    <>
      {pathname === "/" && <LandingPage />}
      {pathname === "/dashboard" && <Dashboard />}
    </>
  );
}
