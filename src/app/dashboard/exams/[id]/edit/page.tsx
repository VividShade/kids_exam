import { notFound, redirect } from 'next/navigation';

import { auth } from '@/auth';
import { ExamBuilder } from '@/components/exam-builder';
import { getOwnedExamSetById } from '@/lib/repository';

export default async function EditExamSetPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/');
  }

  const { id } = await params;
  const examSet = await getOwnedExamSetById(id, session.user.id);

  if (!examSet) {
    notFound();
  }

  return <ExamBuilder initialExamSet={examSet} />;
}
