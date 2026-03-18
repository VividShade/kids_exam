import { NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/auth';
import { completeAttempt, deleteAttempt, getAttemptById, getPublishedExamSetById, saveAttemptProgress } from '@/lib/repository';

const patchSchema = z.object({
  action: z.enum(['save', 'abandon', 'complete']),
  answers: z.record(z.string(), z.string()),
  currentIndex: z.number().int().min(0),
});

function normalizeAnswer(value: string) {
  return value.trim().toLowerCase();
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const payload = patchSchema.parse(await request.json());
    const attempt = await getAttemptById(id, session.user.id);

    if (!attempt) {
      return NextResponse.json({ error: 'Attempt not found.' }, { status: 404 });
    }

    if (payload.action === 'save' || payload.action === 'abandon') {
      await saveAttemptProgress({
        attemptId: id,
        userId: session.user.id,
        answers: payload.answers,
        currentIndex: payload.currentIndex,
        status: payload.action === 'abandon' ? 'abandoned' : 'in_progress',
      });
      return NextResponse.json({ ok: true });
    }

    const examSet = await getPublishedExamSetById(attempt.examSetId);
    if (!examSet) {
      return NextResponse.json({ error: 'Exam set not found.' }, { status: 404 });
    }

    const wrongQuestionIds = examSet.questions
      .filter((question) => normalizeAnswer(payload.answers[question.id] ?? '') !== normalizeAnswer(question.answer))
      .map((question) => question.id);

    const correctCount = examSet.questions.length - wrongQuestionIds.length;
    const score = Math.round((correctCount / examSet.questions.length) * 100);

    await completeAttempt({
      attemptId: id,
      userId: session.user.id,
      answers: payload.answers,
      currentIndex: payload.currentIndex,
      score,
      wrongQuestionIds,
    });

    return NextResponse.json({ ok: true, score, wrongQuestionIds });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update attempt.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  await deleteAttempt(id, session.user.id);
  return NextResponse.json({ ok: true });
}
