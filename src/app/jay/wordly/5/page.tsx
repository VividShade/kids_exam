'use client';

import QuizPage from '@/components/quiz/QuizPage';
import { quizCatalog } from '@/data/quiz/catalog';

export default function WordlyWordTest5() {
  return <QuizPage {...quizCatalog.jay.wordly['5']} />;
}
