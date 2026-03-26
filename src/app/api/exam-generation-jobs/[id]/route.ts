import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { getExamGenerationJobById } from '@/lib/repository';
import { examGenerationJobResultSchema } from '@/lib/schemas';

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const job = await getExamGenerationJobById(id, session.user.id);
  if (!job) {
    return NextResponse.json({ error: 'Job not found.' }, { status: 404 });
  }

  let parsedResult: ReturnType<typeof examGenerationJobResultSchema.safeParse> | null = null;
  if (job.resultJson) {
    try {
      parsedResult = examGenerationJobResultSchema.safeParse(JSON.parse(job.resultJson));
    } catch {
      parsedResult = null;
    }
  }

  return NextResponse.json({
    id: job.id,
    status: job.status,
    errorMessage: job.errorMessage,
    createdAt: job.createdAt,
    startedAt: job.startedAt,
    completedAt: job.completedAt,
    result: parsedResult?.success ? parsedResult.data : null,
  });
}
