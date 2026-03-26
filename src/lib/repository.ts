import 'server-only';

import { createId } from '@/lib/id';
import { dbAll, dbGet, dbRun } from '@/lib/db';
import type {
  AttemptRecord,
  CleanupJobRecord,
  DashboardData,
  ExamGenerationJobRecord,
  ExamBuilderConfig,
  ExamQuestion,
  ExamSetRecord,
  ExamSourceImage,
  OpenAiLogRecord,
} from '@/lib/types';

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  provider: string | null;
  provider_account_id: string | null;
  created_at: string;
  updated_at: string;
};

type ExamSetRow = {
  id: string;
  owner_id: string;
  title: string;
  summary: string;
  status: 'draft' | 'published';
  prompt_text: string;
  selected_shortcut_id: string | null;
  custom_prompt: string | null;
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

type AttemptRow = {
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

type OpenAiLogRow = {
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

type CleanupJobRow = {
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

type ExamGenerationJobRow = {
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

function toNumber(value: number | string | null) {
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

function parseExamSet(row: ExamSetRow): ExamSetRecord {
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
    generateCount: toNumber(row.generate_count) ?? 0,
    lastGeneratedAt: row.last_generated_at,
    promptText: row.prompt_text,
    selectedShortcutId: row.selected_shortcut_id ?? 'vocabulary_mix',
    customPrompt: row.custom_prompt ?? row.source_notes ?? row.prompt_text ?? null,
    config: normalizeConfig(JSON.parse(row.config_json) as ExamBuilderConfig),
    questions: JSON.parse(row.questions_json) as ExamQuestion[],
    sourceImages,
    sourceNotes: row.source_notes,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function parseAttempt(row: AttemptRow): AttemptRecord {
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

function parseCleanupJob(row: CleanupJobRow): CleanupJobRecord {
  return {
    id: row.id,
    jobType: row.job_type,
    payloadJson: row.payload_json,
    status: row.status,
    retryCount: toNumber(row.retry_count) ?? 0,
    runAfter: row.run_after,
    lastError: row.last_error,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function parseOpenAiLog(row: OpenAiLogRow): OpenAiLogRecord {
  return {
    id: row.id,
    userId: row.user_id,
    examSetId: row.exam_set_id,
    model: row.model,
    promptText: row.prompt_text,
    responseText: row.response_text,
    responseJson: row.response_json,
    latencyMs: toNumber(row.latency_ms),
    inputTokens: toNumber(row.input_tokens),
    outputTokens: toNumber(row.output_tokens),
    totalTokens: toNumber(row.total_tokens),
    estimatedCostUsd: toNumber(row.estimated_cost_usd),
    createdAt: row.created_at,
  };
}

function parseExamGenerationJob(row: ExamGenerationJobRow): ExamGenerationJobRecord {
  return {
    id: row.id,
    userId: row.user_id,
    examSetId: row.exam_set_id,
    status: row.status,
    payloadJson: row.payload_json,
    resultJson: row.result_json,
    errorMessage: row.error_message,
    retryCount: toNumber(row.retry_count) ?? 0,
    runAfter: row.run_after,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function upsertUser(input: {
  email: string;
  name?: string | null;
  image?: string | null;
  provider?: string | null;
  providerAccountId?: string | null;
}) {
  const existing = await dbGet<UserRow>('SELECT * FROM users WHERE email = ?', [input.email]);
  const now = new Date().toISOString();

  if (existing) {
    await dbRun(
      `UPDATE users
       SET name = ?, image = ?, provider = ?, provider_account_id = ?, updated_at = ?
       WHERE email = ?`,
      [
        input.name ?? existing.name,
        input.image ?? existing.image,
        input.provider ?? existing.provider,
        input.providerAccountId ?? existing.provider_account_id,
        now,
        input.email,
      ],
    );

    return {
      id: existing.id,
      email: input.email,
    };
  }

  const id = createId('user');
  await dbRun(
    `INSERT INTO users (id, email, name, image, provider, provider_account_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, input.email, input.name ?? null, input.image ?? null, input.provider ?? null, input.providerAccountId ?? null, now, now],
  );

  return { id, email: input.email };
}

export async function getUserById(userId: string) {
  return dbGet<UserRow>('SELECT * FROM users WHERE id = ?', [userId]);
}

export async function saveExamSet(input: {
  id?: string;
  ownerId: string;
  title: string;
  summary: string;
  selectedShortcutId: string;
  customPrompt?: string | null;
  config: ExamBuilderConfig;
  questions: ExamQuestion[];
  sourceImages?: ExamSourceImage[];
  sourceNotes?: string | null;
}) {
  const now = new Date().toISOString();
  const sourceImages = (input.sourceImages ?? []).slice(0, 6);
  const firstImage = sourceImages[0]?.originalPath ?? null;

  if (input.id) {
    await dbRun(
      `UPDATE exam_sets
       SET title = ?, summary = ?, prompt_text = ?, config_json = ?, questions_json = ?, source_image_data_url = ?, source_image_data_urls_json = ?, source_images_json = ?, source_notes = ?, updated_at = ?
       WHERE id = ? AND owner_id = ?`,
      [
        input.title,
        input.summary,
        input.customPrompt ?? '',
        JSON.stringify(normalizeConfig(input.config)),
        JSON.stringify(input.questions),
        firstImage,
        JSON.stringify(sourceImages.map((item) => item.originalPath)),
        JSON.stringify(sourceImages),
        input.sourceNotes ?? null,
        now,
        input.id,
        input.ownerId,
      ],
    );
    await dbRun(
      `UPDATE exam_sets
       SET selected_shortcut_id = ?, custom_prompt = ?
       WHERE id = ? AND owner_id = ?`,
      [input.selectedShortcutId, input.customPrompt ?? null, input.id, input.ownerId],
    );

    return input.id;
  }

  const examSetId = createId('set');
  await dbRun(
    `INSERT INTO exam_sets (
      id, owner_id, title, summary, status, prompt_text, selected_shortcut_id, custom_prompt, config_json, questions_json,
      source_image_data_url, source_image_data_urls_json, source_images_json, source_notes, published_at, created_at, updated_at
     ) VALUES (?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)`,
    [
      examSetId,
      input.ownerId,
      input.title,
      input.summary,
      input.customPrompt ?? '',
      input.selectedShortcutId,
      input.customPrompt ?? null,
      JSON.stringify(normalizeConfig(input.config)),
      JSON.stringify(input.questions),
      firstImage,
      JSON.stringify(sourceImages.map((item) => item.originalPath)),
      JSON.stringify(sourceImages),
      input.sourceNotes ?? null,
      now,
      now,
    ],
  );

  return examSetId;
}

export async function publishExamSet(examSetId: string, ownerId: string) {
  const now = new Date().toISOString();
  await dbRun(
    `UPDATE exam_sets SET status = 'published', published_at = ?, updated_at = ? WHERE id = ? AND owner_id = ?`,
    [now, now, examSetId, ownerId],
  );
}

export async function getOwnedExamSetById(examSetId: string, ownerId: string) {
  const row = await dbGet<ExamSetRow>('SELECT * FROM exam_sets WHERE id = ? AND owner_id = ?', [examSetId, ownerId]);
  return row ? parseExamSet(row) : null;
}

export async function incrementExamSetGenerateCount(examSetId: string, ownerId: string) {
  const now = new Date().toISOString();
  await dbRun(
    `UPDATE exam_sets
     SET generate_count = COALESCE(generate_count, 0) + 1, last_generated_at = ?, updated_at = ?
     WHERE id = ? AND owner_id = ?`,
    [now, now, examSetId, ownerId],
  );
}

export async function getOwnedExamSetGenerateCount(examSetId: string, ownerId: string) {
  const row = await dbGet<{ generate_count: number | string }>('SELECT generate_count FROM exam_sets WHERE id = ? AND owner_id = ?', [examSetId, ownerId]);
  return toNumber(row?.generate_count ?? null) ?? 0;
}

export async function getPublishedExamSetById(examSetId: string) {
  const row = await dbGet<ExamSetRow>('SELECT * FROM exam_sets WHERE id = ? AND status = ?', [examSetId, 'published']);
  return row ? parseExamSet(row) : null;
}

export async function listDashboardData(userId: string): Promise<DashboardData> {
  const [examSetRows, attemptRows] = await Promise.all([
    dbAll<ExamSetRow>('SELECT * FROM exam_sets WHERE owner_id = ? ORDER BY updated_at DESC', [userId]),
    dbAll<AttemptRow>('SELECT * FROM attempts WHERE user_id = ? ORDER BY updated_at DESC', [userId]),
  ]);

  return {
    examSets: examSetRows.map(parseExamSet),
    attempts: attemptRows.map(parseAttempt),
  };
}

export async function getAttemptById(attemptId: string, userId: string) {
  const row = await dbGet<AttemptRow>('SELECT * FROM attempts WHERE id = ? AND user_id = ?', [attemptId, userId]);
  return row ? parseAttempt(row) : null;
}

export async function getActiveAttemptForUser(examSetId: string, userId: string) {
  const row = await dbGet<AttemptRow>(
    `SELECT * FROM attempts
     WHERE exam_set_id = ? AND user_id = ? AND status = 'in_progress'
     ORDER BY updated_at DESC LIMIT 1`,
    [examSetId, userId],
  );

  return row ? parseAttempt(row) : null;
}

export async function createOrResumeAttempt(input: {
  examSetId: string;
  userId: string;
  examTitle: string;
  questions: ExamQuestion[];
  publishedAt: string | null;
}) {
  const existing = await getActiveAttemptForUser(input.examSetId, input.userId);
  if (existing) {
    return existing;
  }

  const now = new Date().toISOString();
  const id = createId('attempt');
  const shuffleSeed = crypto.randomUUID();

  await dbRun(
    `INSERT INTO attempts (
      id, exam_set_id, user_id, status, exam_title_snapshot, questions_snapshot_json, published_at_snapshot,
      answers_json, current_index, score, wrong_question_ids_json, shuffle_seed, started_at, updated_at, completed_at, abandoned_at
     ) VALUES (?, ?, ?, 'in_progress', ?, ?, ?, '{}', 0, NULL, '[]', ?, ?, ?, NULL, NULL)`,
    [id, input.examSetId, input.userId, input.examTitle, JSON.stringify(input.questions), input.publishedAt, shuffleSeed, now, now],
  );

  const created = await getAttemptById(id, input.userId);
  if (!created) {
    throw new Error('Failed to create attempt.');
  }

  return created;
}

export async function saveAttemptProgress(input: {
  attemptId: string;
  userId: string;
  answers: Record<string, string>;
  currentIndex: number;
  status?: 'in_progress' | 'abandoned';
}) {
  const now = new Date().toISOString();
  const nextStatus = input.status ?? 'in_progress';
  await dbRun(
    `UPDATE attempts
     SET answers_json = ?, current_index = ?, status = ?, updated_at = ?, abandoned_at = ?
     WHERE id = ? AND user_id = ?`,
    [
      JSON.stringify(input.answers),
      input.currentIndex,
      nextStatus,
      now,
      nextStatus === 'abandoned' ? now : null,
      input.attemptId,
      input.userId,
    ],
  );
}

export async function completeAttempt(input: {
  attemptId: string;
  userId: string;
  answers: Record<string, string>;
  currentIndex: number;
  score: number;
  wrongQuestionIds: string[];
}) {
  const now = new Date().toISOString();
  await dbRun(
    `UPDATE attempts
     SET answers_json = ?, current_index = ?, status = 'completed', score = ?, wrong_question_ids_json = ?, updated_at = ?, completed_at = ?, abandoned_at = NULL
     WHERE id = ? AND user_id = ?`,
    [
      JSON.stringify(input.answers),
      input.currentIndex,
      input.score,
      JSON.stringify(input.wrongQuestionIds),
      now,
      now,
      input.attemptId,
      input.userId,
    ],
  );
}

export async function deleteAttempt(attemptId: string, userId: string) {
  await dbRun('DELETE FROM attempts WHERE id = ? AND user_id = ?', [attemptId, userId]);
}

export async function createOpenAiLog(input: {
  userId: string;
  examSetId?: string | null;
  model: string;
  promptText: string;
  responseText?: string | null;
  responseJson?: string | null;
  latencyMs?: number | null;
  inputTokens?: number | null;
  outputTokens?: number | null;
  totalTokens?: number | null;
  estimatedCostUsd?: number | null;
}) {
  const id = createId('log');
  const now = new Date().toISOString();

  await dbRun(
    `INSERT INTO openai_logs (
     id, user_id, exam_set_id, model, prompt_text, response_text, response_json,
      latency_ms, input_tokens, output_tokens, total_tokens, estimated_cost_usd, created_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.userId,
      input.examSetId ?? null,
      input.model,
      input.promptText,
      input.responseText ?? null,
      input.responseJson ?? null,
      input.latencyMs ?? null,
      input.inputTokens ?? null,
      input.outputTokens ?? null,
      input.totalTokens ?? null,
      input.estimatedCostUsd ?? null,
      now,
    ],
  );

  return id;
}

export async function attachOpenAiLogToExamSet(logId: string, examSetId: string, userId: string) {
  await dbRun('UPDATE openai_logs SET exam_set_id = ? WHERE id = ? AND user_id = ?', [examSetId, logId, userId]);
}

export async function listOpenAiLogs(limit = 200, offset = 0) {
  const rows = await dbAll<OpenAiLogRow>('SELECT * FROM openai_logs ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offset]);
  return rows.map(parseOpenAiLog);
}

export async function listOpenAiLogsByExamSet(examSetId: string, userId: string, limit = 20) {
  const rows = await dbAll<OpenAiLogRow>(
    `SELECT * FROM openai_logs
     WHERE exam_set_id = ? AND user_id = ?
     ORDER BY created_at DESC
     LIMIT ?`,
    [examSetId, userId, limit],
  );
  return rows.map(parseOpenAiLog);
}

export async function createExamGenerationJob(input: {
  userId: string;
  examSetId?: string | null;
  payloadJson: string;
}) {
  const id = createId('genjob');
  const now = new Date().toISOString();
  await dbRun(
    `INSERT INTO exam_generation_jobs (
      id, user_id, exam_set_id, status, payload_json, result_json, error_message,
      retry_count, run_after, started_at, completed_at, created_at, updated_at
     ) VALUES (?, ?, ?, 'queued', ?, NULL, NULL, 0, ?, NULL, NULL, ?, ?)`,
    [id, input.userId, input.examSetId ?? null, input.payloadJson, now, now, now],
  );
  return id;
}

export async function getExamGenerationJobById(jobId: string, userId: string) {
  const row = await dbGet<ExamGenerationJobRow>('SELECT * FROM exam_generation_jobs WHERE id = ? AND user_id = ?', [jobId, userId]);
  return row ? parseExamGenerationJob(row) : null;
}

export async function getActiveExamGenerationJobByExamSet(examSetId: string, userId: string) {
  const row = await dbGet<ExamGenerationJobRow>(
    `SELECT * FROM exam_generation_jobs
     WHERE exam_set_id = ? AND user_id = ? AND status IN ('queued', 'running')
     ORDER BY created_at DESC
     LIMIT 1`,
    [examSetId, userId],
  );
  return row ? parseExamGenerationJob(row) : null;
}

export async function listActiveExamGenerationJobsByUser(userId: string) {
  const rows = await dbAll<ExamGenerationJobRow>(
    `SELECT * FROM exam_generation_jobs
     WHERE user_id = ? AND exam_set_id IS NOT NULL AND status IN ('queued', 'running')
     ORDER BY created_at DESC`,
    [userId],
  );
  return rows.map(parseExamGenerationJob);
}

export async function claimExamGenerationJobById(jobId: string) {
  const now = new Date().toISOString();
  const row = await dbGet<ExamGenerationJobRow>(
    `SELECT * FROM exam_generation_jobs
     WHERE id = ? AND status = 'queued' AND run_after <= ?`,
    [jobId, now],
  );
  if (!row) {
    return null;
  }
  await dbRun(
    `UPDATE exam_generation_jobs
     SET status = 'running', started_at = ?, updated_at = ?
     WHERE id = ? AND status = 'queued'`,
    [now, now, jobId],
  );
  const claimed = await dbGet<ExamGenerationJobRow>('SELECT * FROM exam_generation_jobs WHERE id = ? AND status = ?', [jobId, 'running']);
  return claimed ? parseExamGenerationJob(claimed) : null;
}

export async function claimExamGenerationJobs(limit = 10) {
  const now = new Date().toISOString();
  const rows = await dbAll<ExamGenerationJobRow>(
    `SELECT * FROM exam_generation_jobs
     WHERE status = 'queued' AND run_after <= ?
     ORDER BY created_at ASC
     LIMIT ?`,
    [now, limit],
  );
  const jobs = rows.map(parseExamGenerationJob);
  const claimed: ExamGenerationJobRecord[] = [];
  for (const job of jobs) {
    await dbRun(
      `UPDATE exam_generation_jobs
       SET status = 'running', started_at = ?, updated_at = ?
       WHERE id = ? AND status = 'queued'`,
      [now, now, job.id],
    );
    const row = await dbGet<ExamGenerationJobRow>('SELECT * FROM exam_generation_jobs WHERE id = ? AND status = ?', [job.id, 'running']);
    if (row) {
      claimed.push(parseExamGenerationJob(row));
    }
  }
  return claimed;
}

export async function markExamGenerationJobCompleted(jobId: string, resultJson: string) {
  const now = new Date().toISOString();
  await dbRun(
    `UPDATE exam_generation_jobs
     SET status = 'completed', result_json = ?, error_message = NULL, completed_at = ?, updated_at = ?
     WHERE id = ?`,
    [resultJson, now, now, jobId],
  );
}

export async function markExamGenerationJobFailed(jobId: string, retryCount: number, errorMessage: string) {
  const now = new Date().toISOString();
  await dbRun(
    `UPDATE exam_generation_jobs
     SET status = 'failed', retry_count = ?, error_message = ?, completed_at = ?, updated_at = ?
     WHERE id = ?`,
    [retryCount, errorMessage.slice(0, 600), now, now, jobId],
  );
}

export async function createCleanupJobForStoragePaths(paths: string[]) {
  if (paths.length === 0) {
    return null;
  }

  const id = createId('cleanup');
  const now = new Date().toISOString();
  await dbRun(
    `INSERT INTO cleanup_jobs (
      id, job_type, payload_json, status, retry_count, run_after, last_error, created_at, updated_at
     ) VALUES (?, 'delete_storage_paths', ?, 'queued', 0, ?, NULL, ?, ?)`,
    [id, JSON.stringify({ paths }), now, now, now],
  );

  return id;
}

export async function claimCleanupJobs(limit = 20) {
  const now = new Date().toISOString();
  const rows = await dbAll<CleanupJobRow>(
    `SELECT * FROM cleanup_jobs
     WHERE status = 'queued' AND run_after <= ?
     ORDER BY created_at ASC
     LIMIT ?`,
    [now, limit],
  );

  const jobs = rows.map(parseCleanupJob);
  for (const job of jobs) {
    await dbRun(`UPDATE cleanup_jobs SET status = 'running', updated_at = ? WHERE id = ? AND status = 'queued'`, [now, job.id]);
  }

  return jobs;
}

export async function markCleanupJobDone(jobId: string) {
  const now = new Date().toISOString();
  await dbRun(`UPDATE cleanup_jobs SET status = 'done', updated_at = ? WHERE id = ?`, [now, jobId]);
}

export async function markCleanupJobFailed(jobId: string, retryCount: number, errorMessage: string) {
  const now = Date.now();
  const delayMs = Math.min(60 * 60 * 1000, Math.pow(2, retryCount) * 30 * 1000);
  const runAfter = new Date(now + delayMs).toISOString();
  await dbRun(
    `UPDATE cleanup_jobs
     SET status = ?, retry_count = ?, run_after = ?, last_error = ?, updated_at = ?
     WHERE id = ?`,
    [retryCount >= 8 ? 'failed' : 'queued', retryCount, runAfter, errorMessage.slice(0, 600), new Date(now).toISOString(), jobId],
  );
}

export async function listReferencedStoragePaths() {
  const rows = await dbAll<{ source_images_json: string | null }>(
    `SELECT source_images_json
     FROM exam_sets
     WHERE source_images_json IS NOT NULL AND source_images_json <> ''`,
  );

  const set = new Set<string>();
  for (const row of rows) {
    if (!row.source_images_json) {
      continue;
    }
    try {
      const images = JSON.parse(row.source_images_json) as ExamSourceImage[];
      for (const image of images) {
        if (image.originalPath) {
          set.add(image.originalPath);
        }
        if (image.thumbnailPath) {
          set.add(image.thumbnailPath);
        }
      }
    } catch {
      continue;
    }
  }

  return Array.from(set);
}
