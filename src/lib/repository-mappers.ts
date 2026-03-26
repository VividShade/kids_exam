import { createId } from '@/lib/id';
import {
  type AttemptRecord,
  type CleanupJobRecord,
  type ExamBuilderConfig,
  type ExamGenerationJobRecord,
  type ExamQuestion,
  type ExamSetRecord,
  type ExamSourceImage,
  type OpenAiLogRecord,
} from '@/lib/types';

export type ExamSetRow = {
  id: string;
  owner_id: string;
  title: string;
  summary: string;
  status: 'draft' | 'published';
  prompt_text: string;
  selected_shortcut_id: string | null;
  custom_prompt: string | null;
  output_keywords_json: string | null;
  config_json: string;
  questions_json: string;
  source_image_data_url: string | null;
  source_image_data_urls_json: string | null;
  source_images_json: string | null;
  source_notes: string | null;
  generate_count: number | string;
  last_generated_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AttemptRow = {
  id: string;
  exam_set_id: string;
  user_id: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  exam_title_snapshot: string;
  questions_snapshot_json: string;
  published_at_snapshot: string | null;
  answers_json: string;
  current_index: number;
  score: number | null;
  wrong_question_ids_json: string;
  shuffle_seed: string;
  started_at: string;
  updated_at: string;
  completed_at: string | null;
  abandoned_at: string | null;
};

export type OpenAiLogRow = {
  id: string;
  user_id: string;
  exam_set_id: string | null;
  model: string;
  prompt_text: string;
  response_text: string | null;
  response_json: string | null;
  latency_ms: number | string | null;
  input_tokens: number | string | null;
  output_tokens: number | string | null;
  total_tokens: number | string | null;
  estimated_cost_usd: number | string | null;
  created_at: string;
};

export type CleanupJobRow = {
  id: string;
  job_type: 'delete_storage_paths';
  payload_json: string;
  status: 'queued' | 'running' | 'done' | 'failed';
  retry_count: number | string;
  run_after: string;
  last_error: string | null;
  created_at: string;
  updated_at: string;
};

export type ExamGenerationJobRow = {
  id: string;
  user_id: string;
  exam_set_id: string | null;
  status: 'queued' | 'running' | 'completed' | 'failed';
  payload_json: string;
  result_json: string | null;
  error_message: string | null;
  retry_count: number | string;
  run_after: string;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export function toNullableNumber(value: number | string | null) {
  if (value === null || value === undefined) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeConfig(config: ExamBuilderConfig) {
  return {
    ...config,
    uiLanguage: config.uiLanguage ?? 'en',
    promptLanguage: config.promptLanguage ?? 'en',
    sourceLanguage: config.sourceLanguage ?? 'auto',
    examLanguage: config.examLanguage ?? 'English',
  };
}

export function parseExamSet(row: ExamSetRow): ExamSetRecord {
  const sourceImages = row.source_images_json
    ? (JSON.parse(row.source_images_json) as ExamSourceImage[])
    : row.source_image_data_urls_json
      ? (JSON.parse(row.source_image_data_urls_json) as string[]).map((path) => ({
          id: createId('img_legacy'),
          originalPath: path,
          thumbnailPath: path,
          width: 0,
          height: 0,
          thumbWidth: 0,
          thumbHeight: 0,
          sizeBytes: 0,
          uploadedAt: row.created_at,
        }))
      : row.source_image_data_url
        ? [
            {
              id: createId('img_legacy'),
              originalPath: row.source_image_data_url,
              thumbnailPath: row.source_image_data_url,
              width: 0,
              height: 0,
              thumbWidth: 0,
              thumbHeight: 0,
              sizeBytes: 0,
              uploadedAt: row.created_at,
            },
          ]
        : [];

  return {
    id: row.id,
    ownerId: row.owner_id,
    title: row.title,
    summary: row.summary,
    status: row.status,
    generateCount: toNullableNumber(row.generate_count) ?? 0,
    lastGeneratedAt: row.last_generated_at,
    promptText: row.prompt_text,
    selectedShortcutId: row.selected_shortcut_id ?? 'vocabulary_mix',
    customPrompt: row.custom_prompt ?? row.source_notes ?? row.prompt_text ?? null,
    outputKeywords: row.output_keywords_json ? (JSON.parse(row.output_keywords_json) as string[]) : [],
    config: normalizeConfig(JSON.parse(row.config_json) as ExamBuilderConfig),
    questions: JSON.parse(row.questions_json) as ExamQuestion[],
    sourceImages,
    sourceNotes: row.source_notes,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function parseAttempt(row: AttemptRow): AttemptRecord {
  return {
    id: row.id,
    examSetId: row.exam_set_id,
    userId: row.user_id,
    status: row.status,
    examTitleSnapshot: row.exam_title_snapshot ?? '',
    questionsSnapshot: row.questions_snapshot_json ? (JSON.parse(row.questions_snapshot_json) as ExamQuestion[]) : [],
    publishedAtSnapshot: row.published_at_snapshot,
    answers: JSON.parse(row.answers_json) as Record<string, string>,
    currentIndex: row.current_index,
    score: row.score,
    wrongQuestionIds: JSON.parse(row.wrong_question_ids_json) as string[],
    shuffleSeed: row.shuffle_seed || '',
    startedAt: row.started_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
    abandonedAt: row.abandoned_at,
  };
}

export function parseCleanupJob(row: CleanupJobRow): CleanupJobRecord {
  return {
    id: row.id,
    jobType: row.job_type,
    payloadJson: row.payload_json,
    status: row.status,
    retryCount: toNullableNumber(row.retry_count) ?? 0,
    runAfter: row.run_after,
    lastError: row.last_error,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function parseOpenAiLog(row: OpenAiLogRow): OpenAiLogRecord {
  return {
    id: row.id,
    userId: row.user_id,
    examSetId: row.exam_set_id,
    model: row.model,
    promptText: row.prompt_text,
    responseText: row.response_text,
    responseJson: row.response_json,
    latencyMs: toNullableNumber(row.latency_ms),
    inputTokens: toNullableNumber(row.input_tokens),
    outputTokens: toNullableNumber(row.output_tokens),
    totalTokens: toNullableNumber(row.total_tokens),
    estimatedCostUsd: toNullableNumber(row.estimated_cost_usd),
    createdAt: row.created_at,
  };
}

export function parseExamGenerationJob(row: ExamGenerationJobRow): ExamGenerationJobRecord {
  return {
    id: row.id,
    userId: row.user_id,
    examSetId: row.exam_set_id,
    status: row.status,
    payloadJson: row.payload_json,
    resultJson: row.result_json,
    errorMessage: row.error_message,
    retryCount: toNullableNumber(row.retry_count) ?? 0,
    runAfter: row.run_after,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
