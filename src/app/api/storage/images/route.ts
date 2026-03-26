import { NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/auth';
import { uploadExamSourceImages } from '@/lib/storage';

const requestSchema = z.object({
  images: z
    .array(
      z.object({
        originalBase64: z.string().min(1),
        thumbnailBase64: z.string().min(1),
        width: z.number().positive(),
        height: z.number().positive(),
        thumbWidth: z.number().positive(),
        thumbHeight: z.number().positive(),
        sizeBytes: z.number().int().positive(),
      }),
    )
    .min(1)
    .max(5),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = requestSchema.parse(await request.json());
    const uploaded = await uploadExamSourceImages(session.user.id, payload.images);
    return NextResponse.json({ images: uploaded });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to upload images.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

