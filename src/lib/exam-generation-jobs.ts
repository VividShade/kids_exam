import 'server-only';

import { generateExamSetFromImages } from '@/lib/openai';
import {
  attachOpenAiLogToExamSet,
  claimExamGenerationJobById,
  claimExamGenerationJobs,
  createOpenAiLog,
  incrementExamSetGenerateCount,
  markExamGenerationJobCompleted,
  markExamGenerationJobFailed,
  saveExamSet,
} from '@/lib/repository';
import { examGenerationJobPayloadSchema } from '@/lib/schemas';
import type { ExamGenerationJobRecord } from '@/lib/types';

const DEFAULT_EXAM_SET_TITLE = 'Untitled Quiz';

async function processClaimedExamGenerationJob(job: ExamGenerationJobRecord) {
  try {
    const payload = examGenerationJobPayloadSchema.parse(JSON.parse(job.payloadJson));
    const defaultPromptByCategory: Record<string, string> = {
      vocabulary_mix: 'Create a vocabulary-focused quiz based on the source material.',
      reading_check: 'Create a reading comprehension quiz from the source material.',
      grammar_practice: 'Create a grammar practice quiz related to the source material.',
    };
    const mergedNotes = [defaultPromptByCategory[payload.selectedShortcutId] ?? '', payload.customPrompt]
      .map((value) => value.trim())
      .filter(Boolean)
      .join('\n\n');

    const result = await generateExamSetFromImages({
      imageDataUrls: payload.imageDataUrls,
      config: payload.config,
      notes: mergedNotes,
    });

    const generationLogId = await createOpenAiLog({
      userId: job.userId,
      examSetId: payload.examSetId ?? null,
      ...result.log,
    });

    const requestedTitle = payload.title.trim();
    const resolvedTitle =
      requestedTitle.length === 0 || requestedTitle === DEFAULT_EXAM_SET_TITLE
        ? result.generated.title
        : requestedTitle;

    const examSetId = await saveExamSet({
      id: payload.examSetId,
      ownerId: job.userId,
      title: resolvedTitle,
      summary: result.generated.summary,
      selectedShortcutId: payload.selectedShortcutId,
      customPrompt: payload.customPrompt,
      outputKeywords: result.generated.outputKeywords ?? [],
      sourceImages: payload.sourceImages,
      sourceNotes: payload.customPrompt,
      config: payload.config,
      questions: result.generated.questions,
    });

    if (!payload.examSetId) {
      await attachOpenAiLogToExamSet(generationLogId, examSetId, job.userId);
    }

    await incrementExamSetGenerateCount(examSetId, job.userId);
    await markExamGenerationJobCompleted(
      job.id,
      JSON.stringify({
        examSetId,
        generationLogId,
        title: resolvedTitle,
        generated: result.generated,
      }),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to process generation job.';
    await markExamGenerationJobFailed(job.id, job.retryCount + 1, message);
  }
}

export async function processExamGenerationJobById(jobId: string) {
  const job = await claimExamGenerationJobById(jobId);
  if (!job) {
    return false;
  }
  await processClaimedExamGenerationJob(job);
  return true;
}

export async function processQueuedExamGenerationJobs(limit = 5) {
  const jobs = await claimExamGenerationJobs(limit);
  let processed = 0;
  for (const job of jobs) {
    await processClaimedExamGenerationJob(job);
    processed += 1;
  }
  return processed;
}
