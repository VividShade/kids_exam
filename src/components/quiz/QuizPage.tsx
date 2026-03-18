'use client';

import QuizTemplate, { quizTextEn, quizTextKo, type QuizTemplateProps } from './QuizTemplate';

export type QuizPageProps = Omit<QuizTemplateProps, 'text'> & {
  text: 'en' | 'ko';
};

export default function QuizPage({ text, ...props }: QuizPageProps) {
  return <QuizTemplate {...props} text={text === 'ko' ? quizTextKo : quizTextEn} />;
}
