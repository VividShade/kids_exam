import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { listActiveExamGenerationJobsByUser } from '@/lib/repository';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const jobs = await listActiveExamGenerationJobsByUser(session.user.id);
  return NextResponse.json({
    jobs: jobs.map((job) => ({
      id: job.id,
      examSetId: job.examSetId,
      status: job.status,
      updatedAt: job.updatedAt,
    })),
  });
}
