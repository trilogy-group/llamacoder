export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-brand antialiased">
      <div className="isolate">{children}</div>
    </div>
  );
}