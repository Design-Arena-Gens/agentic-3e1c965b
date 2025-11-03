import type { Metadata } from 'next';
import './globals.css';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'DesignArena.ai ? AI vs AI Design Battle',
  description: 'Vote. Compare. Discover. Where AIs Compete, Creativity Wins.',
  metadataBase: new URL('https://agentic-3e1c965b.vercel.app'),
  openGraph: {
    title: 'DesignArena.ai ? AI vs AI Design Battle',
    description: 'Vote. Compare. Discover. Where AIs Compete, Creativity Wins.',
    type: 'website'
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
