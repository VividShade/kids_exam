import { notFound, redirect } from 'next/navigation';

import { auth } from '@/auth';
import { ExamRunner } from '@/components/exam-runner';
import { getAttemptById, getPublishedExamSetById } from '@/lib/repository';

export default async function ExamSolvePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ attempt?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/');
  }

  const { id } = await params;
  const { attempt: attemptId } = await searchParams;
  const examSet = await getPublishedExamSetById(id);

  if (!examSet) {
    notFound();
  }

  const attempt = attemptId ? await getAttemptById(attemptId, session.user.id) : null;
  if (attempt?.status === 'completed') {
    redirect('/dashboard');
  }
  const examSetForAttempt =
    attempt && attempt.questionsSnapshot.length > 0
      ? {
          ...examSet,
          title: attempt.examTitleSnapshot || examSet.title,
          questions: attempt.questionsSnapshot,
        }
      : examSet;

  return <ExamRunner examSet={examSetForAttempt} initialAttempt={attempt} />;
}
