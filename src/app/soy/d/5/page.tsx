'use client';

import QuizPage from '@/components/quiz/QuizPage';
import { quizCatalog } from '@/data/quiz/catalog';

export default function VocabQuizPage() {
  return <QuizPage {...quizCatalog.soy.d['5']} />;
}
