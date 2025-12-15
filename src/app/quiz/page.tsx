// app/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';

type QuizLink = {
  slug: string;
  title: string;
  description: string;
  questionsLabel: string;
};

const QUIZZES: QuizLink[] = [
  {
    slug: '/quiz/k',
    title: 'A to Z Mysteries: The Kidnapped King',
    description: '20문제로 구성된 영어/한국어 복습 퀴즈',
    questionsLabel: '20문제',
  },
  {
    slug: '/quiz/l',
    title: 'A to Z Mysteries: The Lucky Lottery',
    description: '20문제로 구성된 영어/한국어 복습 퀴즈',
    questionsLabel: '20문제',
  },
  {
    slug: '/quiz/m',
    title: 'A to Z Mysteries: The Missing Mummy',
    description: '20문제로 구성된 영어/한국어 복습 퀴즈',
    questionsLabel: '20문제',
  },
  {
    slug: '/quiz/n',
    title: 'A to Z Mysteries: The Ninth Nugget',
    description: '20문제로 구성된 영어/한국어 복습 퀴즈',
    questionsLabel: '20문제',
  },
  {
    slug: '/quiz/o',
    title: 'A to Z Mysteries: The Orange Outlaw',
    description: '20문제로 구성된 영어/한국어 복습 퀴즈',
    questionsLabel: '20문제',
  },
  {
    slug: '/quiz/p',
    title: 'A to Z Mysteries: The Panda Puzzle',
    description: '20문제로 구성된 영어/한국어 복습 퀴즈',
    questionsLabel: '20문제',
  },
];

export const metadata: Metadata = {
  title: '복습 퀴즈 목록',
  description: '여러 권의 영어/한국어 20문제 복습 퀴즈를 한 곳에서 선택하세요.',
};

const baseButton =
  'inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition shadow-sm';
const primaryButton = 'bg-indigo-600 text-white hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-lg';
const cardBase =
  'group block rounded-2xl border border-slate-200 bg-white p-5 shadow-md transition duration-150 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-xl';

export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 pb-12 pt-10">
      <header className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">퀴즈 모음</p>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold leading-tight text-slate-900">복습 퀴즈 허브</h1>
            <p className="text-base text-slate-600">각 책의 내용을 20문제 퀴즈로 복습해 보세요.</p>
          </div>
          <Link href="/k" className={`${baseButton} ${primaryButton}`}>
            The Kidnapped King 시작하기 →
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="퀴즈 목록">
        {QUIZZES.map((quiz) => (
          <Link key={quiz.slug} href={quiz.slug} className={cardBase}>
            <div className="flex justify-between">
              <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
                {quiz.questionsLabel}
              </span>
              <span className="text-xs font-semibold text-slate-400">A to Z Mysteries</span>
            </div>
            <h2 className="mt-3 text-lg font-bold text-slate-900">{quiz.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{quiz.description}</p>
            <span className="mt-4 inline-flex items-center text-sm font-semibold text-indigo-600">퀴즈 시작하기 →</span>
          </Link>
        ))}
      </section>
    </main>
  );
}
