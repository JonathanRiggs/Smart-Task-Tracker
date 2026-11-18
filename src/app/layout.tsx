import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import "bulma/css/bulma.min.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Task Tracker",
  description: "Organize your tasks by project and due date.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
