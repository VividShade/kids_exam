import { notFound, redirect } from 'next/navigation';

import { auth } from '@/auth';
import { ExamBuilder } from '@/components/exam-builder';
import { getOwnedExamSetById } from '@/lib/repository';
import { createSignedImageUrl } from '@/lib/storage';

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

  async function safeSignedUrl(path: string) {
    try {
      return await createSignedImageUrl(path, 60 * 30);
    } catch {
      return null;
    }
  }

  const sourceImages = await Promise.all(
    examSet.sourceImages.map(async (image) => ({
      ...image,
      originalSignedUrl: await safeSignedUrl(image.originalPath),
      thumbnailSignedUrl: await safeSignedUrl(image.thumbnailPath),
    })),
  );

  return <ExamBuilder initialExamSet={{ ...examSet, sourceImages }} />;
}
