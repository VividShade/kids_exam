import 'server-only';

import { z } from 'zod';

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
import type { ExamGenerationJobRecord } from '@/lib/types';

const questionSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(['multiple_choice', 'true_false', 'short_answer']),
  prompt: z.string().min(1),
  choices: z.array(z.string()),
  answer: z.string().min(1),
  explanation: z.string().min(1),
});

const generatedExamSetSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  gradeBand: z.string().min(1),
  sourceSummary: z.string().min(1),
  outputSummary: z.string().min(1),
  sourceKeywords: z.array(z.string()),
  outputKeywords: z.array(z.string()),
  recommendedPrompts: z.array(z.string()),
  questions: z.array(questionSchema).min(1),
});

const configSchema = z.object({
  title: z.string().default(''),
  gradeBand: z.string().min(1),
  notes: z.string().default(''),
  uiLanguage: z.enum(['en', 'ko', 'es']).default('en'),
  promptLanguage: z.enum(['en', 'ko', 'es']).default('en'),
  sourceLanguage: z.string().default('auto'),
  examLanguage: z.string().min(1),
  blueprints: z.array(
    z.object({
      label: z.string().min(1),
      format: z.enum(['multiple_choice', 'true_false', 'short_answer']),
      count: z.number().int().positive(),
      focus: z.string().min(1),
    }),
  ),
});

const sourceImageSchema = z.object({
  id: z.string(),
  originalPath: z.string(),
  thumbnailPath: z.string(),
  width: z.number(),
  height: z.number(),
  thumbWidth: z.number(),
  thumbHeight: z.number(),
  sizeBytes: z.number(),
  uploadedAt: z.string(),
});

export const examGenerationJobPayloadSchema = z.object({
  examSetId: z.string().optional(),
  imageDataUrls: z.array(z.string().min(1)).min(1).max(6),
  notes: z.string().default(''),
  title: z.string().min(1),
  promptText: z.string().min(1),
  sourceImages: z.array(sourceImageSchema).max(6),
  config: configSchema,
});

export const examGenerationJobResultSchema = z.object({
  examSetId: z.string().min(1),
  generationLogId: z.string().min(1),
  generated: generatedExamSetSchema,
});

async function processClaimedExamGenerationJob(job: ExamGenerationJobRecord) {
  try {
    const payload = examGenerationJobPayloadSchema.parse(JSON.parse(job.payloadJson));
    const result = await generateExamSetFromImages({
      imageDataUrls: payload.imageDataUrls,
      config: payload.config,
      notes: payload.notes,
    });

    const generationLogId = await createOpenAiLog({
      userId: job.userId,
      examSetId: payload.examSetId ?? null,
      ...result.log,
    });

    const examSetId = await saveExamSet({
      id: payload.examSetId,
      ownerId: job.userId,
      title: payload.title,
      summary: result.generated.summary,
      promptText: payload.promptText,
      sourceImages: payload.sourceImages,
      sourceNotes: payload.notes,
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
