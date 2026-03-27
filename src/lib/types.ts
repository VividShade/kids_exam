import type { z } from 'zod';

import type {
  directGenerateExamSetRequestSchema,
  examBuilderConfigSchema,
  examGenerationJobPayloadSchema,
  examGenerationJobResultSchema,
  examQuestionSchema,
  examSourceImageSchema,
  generatedExamSetSchema,
  questionBlueprintSchema,
  questionKindSchema,
  saveExamSetRequestSchema,
  uiLanguageSchema,
  uploadExamSourceImagesRequestSchema,
} from '@/lib/schemas';

export type QuestionKind = z.infer<typeof questionKindSchema>;
export type UILanguage = z.infer<typeof uiLanguageSchema>;
export type ExamQuestion = z.infer<typeof examQuestionSchema>;
export type QuestionBlueprint = z.infer<typeof questionBlueprintSchema>;
export type ExamBuilderConfig = z.infer<typeof examBuilderConfigSchema>;
export type GeneratedExamSet = z.infer<typeof generatedExamSetSchema>;
export type ExamSourceImage = z.infer<typeof examSourceImageSchema> & {
  originalSignedUrl?: string;
  thumbnailSignedUrl?: string;
};

export type ExamGenerationJobPayload = z.infer<typeof examGenerationJobPayloadSchema>;
export type ExamGenerationJobResult = z.infer<typeof examGenerationJobResultSchema>;
export type SaveExamSetRequest = z.infer<typeof saveExamSetRequestSchema>;
export type DirectGenerateExamSetRequest = z.infer<typeof directGenerateExamSetRequestSchema>;
export type UploadExamSourceImagesRequest = z.infer<typeof uploadExamSourceImagesRequestSchema>;

export type ExamSetRecord = {
  id: string;
  ownerId: string;
  title: string;
  summary: string;
  status: 'draft' | 'published';
  generateCount: number;
  lastGeneratedAt: string | null;
  promptText: string;
  selectedShortcutId: string;
  customPrompt: string | null;
  outputKeywords: string[];
  config: ExamBuilderConfig;
  questions: ExamQuestion[];
  sourceImages: ExamSourceImage[];
  sourceNotes: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AttemptRecord = {
  id: string;
  examSetId: string;
  userId: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  examTitleSnapshot: string;
  questionsSnapshot: ExamQuestion[];
  publishedAtSnapshot: string | null;
  answers: Record<string, string>;
  currentIndex: number;
  score: number | null;
  wrongQuestionIds: string[];
  shuffleSeed: string;
  startedAt: string;
  updatedAt: string;
  completedAt: string | null;
  abandonedAt: string | null;
};

export type DashboardData = {
  examSets: ExamSetRecord[];
  attempts: AttemptRecord[];
};

export type OpenAiLogRecord = {
  id: string;
  userId: string;
  examSetId: string | null;
  correlationId: string | null;
  model: string;
  route: string | null;
  status: 'success' | 'failed';
  errorType: string | null;
  promptText: string;
  responseText: string | null;
  responseJson: string | null;
  latencyMs: number | null;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  estimatedCostUsd: number | null;
  createdAt: string;
};

export type CleanupJobRecord = {
  id: string;
  jobType: 'delete_storage_paths';
  payloadJson: string;
  status: 'queued' | 'running' | 'done' | 'failed';
  retryCount: number;
  runAfter: string;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminCleanupRunRecord = {
  id: string;
  runType: 'scheduled' | 'manual';
  status: 'success' | 'failed';
  triggeredBy: string | null;
  dryRun: boolean;
  orphanCount: number;
  removedCount: number;
  failedCount: number;
  durationMs: number | null;
  errorMessage: string | null;
  createdAt: string;
};

export type ExamGenerationJobRecord = {
  id: string;
  userId: string;
  examSetId: string | null;
  status: 'queued' | 'running' | 'completed' | 'failed';
  payloadJson: string;
  resultJson: string | null;
  errorMessage: string | null;
  retryCount: number;
  runAfter: string;
  createdAt: string;
  updatedAt: string;
  startedAt: string | null;
  completedAt: string | null;
};

export type AdminUserSummaryRecord = {
  userId: string;
  email: string;
  createdAt: string;
  status: 'active' | 'suspended';
  recentRequestCount: number;
  recentAttemptCount: number;
};
