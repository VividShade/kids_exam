'use client';

import QuizPage from '@/components/quiz/QuizPage';
import { quizCatalog } from '@/data/quiz/catalog';

export default function VocabularyTest() {
  return <QuizPage {...quizCatalog.jay.mcr['5-1']} />;
}
