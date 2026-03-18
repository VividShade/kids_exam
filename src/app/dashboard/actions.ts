'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { deleteAttempt, publishExamSet } from '@/lib/repository';

export async function publishExamSetAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/');
  }

  const examSetId = String(formData.get('examSetId') ?? '');
  if (!examSetId) {
    return;
  }

  await publishExamSet(examSetId, session.user.id);
  revalidatePath('/dashboard');
}

export async function deleteAttemptAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/');
  }

  const attemptId = String(formData.get('attemptId') ?? '');
  if (!attemptId) {
    return;
  }

  await deleteAttempt(attemptId, session.user.id);
  revalidatePath('/dashboard');
}
