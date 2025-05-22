import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "DJ Khaled reactionator",
  description: "Express your feelings and situations with DJ-Khaled gifs",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
            <head>
        {/* Google Analytics - gtag.js */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-TYLDJ2M8FG"
          strategy="afterInteractive" // Loads after the page becomes interactive
        />
        <Script
          id="google-analytics-init" // Unique ID for the script
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-TYLDJ2M8FG');
            `,
          }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
