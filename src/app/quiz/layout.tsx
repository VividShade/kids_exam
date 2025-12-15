// app/layout.tsx
import type { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = {
  title: '복습 퀴즈 허브',
  description: '영어/한국어 20문제 복습 퀴즈 모음',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="bg-slate-100 text-slate-900">{children}</body>
    </html>
  );
}
