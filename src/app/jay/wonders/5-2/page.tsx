'use client';

import QuizPage from '@/components/quiz/QuizPage';
import { quizCatalog } from '@/data/quiz/catalog';

export default function RanitaQuizPage() {
  return <QuizPage {...quizCatalog.jay.wonders['5-2']} />;
}
