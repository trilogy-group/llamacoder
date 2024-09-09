export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-brand antialiased">
        <div className="isolate">{children}</div>
      </body>
    </html>
  );
}