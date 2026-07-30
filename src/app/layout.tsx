import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stack the Days",
  description: "Daily logs from an ultralearning project: teaching myself electric guitar from scratch.",
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
              <div className="site-tagline">learning electric guitar from zero, one logged day at a time</div>
            </div>
            <nav className="site-nav">
              <Link href="/">Home</Link>
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
