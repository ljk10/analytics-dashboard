import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // Correct path for root app/
import { ThemeProvider } from "@/components/theme-provider"; // Alias to src/components/

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Analytics Dashboard",
  description: "Full-stack analytics dashboard project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
  attribute="class"
  defaultTheme="light"
  disableTransitionOnChange
>
  {children}
</ThemeProvider>
      </body>
    </html>
  );
}