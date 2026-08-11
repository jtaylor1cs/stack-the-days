import type { Metadata } from "next";
import Link from "next/link";
import { AuthStatus } from "@/components/AuthStatus";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stack the Days",
  description: "Striving to learn more and track my progress one day at a time.",
  metadataBase: new URL("https://stackthedays.example.com"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="site">
          <header className="site-header">
            <div>
              <Link href="/" className="site-title">
                Stack the Days
              </Link>
              <div className="site-tagline">Striving to learn more and track my progress one day at a time</div>
            </div>
            <nav className="site-nav">
              <Link href="/">Home</Link>
              <AuthStatus />
            </nav>
          </header>

          {children}

          <footer className="site-footer">
            <span>&copy; {new Date().getFullYear()} Stack the Days</span>
          </footer>
        </div>
      </body>
    </html>
  );
}
