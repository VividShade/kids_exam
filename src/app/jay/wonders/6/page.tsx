'use client';

import QuizPage from '@/components/quiz/QuizPage';
import { quizCatalog } from '@/data/quiz/catalog';

export default function PecosBillQuizPage() {
  return <QuizPage {...quizCatalog.jay.wonders['6']} />;
}
