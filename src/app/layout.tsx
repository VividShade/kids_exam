import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'Exam Builder Hub',
  description: 'Generate exam sets from images, publish them, and review quiz history.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
