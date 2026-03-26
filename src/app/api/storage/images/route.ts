import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { uploadExamSourceImagesRequestSchema } from '@/lib/schemas';
import { uploadExamSourceImages } from '@/lib/storage';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = uploadExamSourceImagesRequestSchema.parse(await request.json());
    const uploaded = await uploadExamSourceImages(session.user.id, payload.images);
    return NextResponse.json({ images: uploaded });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to upload images.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
