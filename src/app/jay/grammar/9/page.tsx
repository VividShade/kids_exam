'use client';

import QuizPage from '@/components/quiz/QuizPage';
import { quizCatalog } from '@/data/quiz/catalog';

export default function PresentContinuousQuiz() {
  return <QuizPage {...quizCatalog.jay.grammar['9']} />;
}
