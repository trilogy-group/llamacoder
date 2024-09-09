import { AppProvider } from "@/contexts/AppContext";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-brand antialiased">
        <AppProvider>
          <div className="isolate">{children}</div>
        </AppProvider>
      </body>
    </html>
  );
}
