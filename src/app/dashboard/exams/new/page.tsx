import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { ExamBuilder } from '@/components/exam-builder';

export default async function NewExamSetPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/');
  }

  return <ExamBuilder />;
}
