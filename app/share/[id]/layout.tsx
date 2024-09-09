export default function ShareLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center">
      {children}
    </div>
  );
}
