import 'server-only';

import { createId } from '@/lib/id';
import { dbAll, dbGet, dbRun } from '@/lib/db';
import {
  extractOutputKeywordsFromResponseJson,
  extractQuestionsSignatureFromResponseJson,
} from '@/lib/generated-exam-parser';
import {
  type AttemptRow,
  type AdminCleanupRunRow,
  type CleanupJobRow,
  type ExamGenerationJobRow,
  type ExamSetRow,
  type OpenAiLogRow,
  parseAttempt,
  parseAdminCleanupRun,
  parseCleanupJob,
  parseExamGenerationJob,
  parseExamSet,
  parseOpenAiLog,
  toNullableNumber,
} from '@/lib/repository-mappers';
import type {
  AdminCleanupRunRecord,
  DashboardData,
  ExamBuilderConfig,
  ExamGenerationJobRecord,
  ExamQuestion,
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

function normalizeConfig(config: ExamBuilderConfig) {
  return {
    ...config,
    uiLanguage: config.uiLanguage ?? 'en',
    promptLanguage: config.promptLanguage ?? 'en',
    sourceLanguage: config.sourceLanguage ?? 'auto',
    examLanguage: config.examLanguage ?? 'English',
    blueprints: (config.blueprints ?? []).map((blueprint) => ({
      ...blueprint,
      enabled: blueprint.enabled ?? true,
    })),
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
  outputKeywords?: string[];
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
       SET selected_shortcut_id = ?, custom_prompt = ?, output_keywords_json = ?
       WHERE id = ? AND owner_id = ?`,
      [input.selectedShortcutId, input.customPrompt ?? null, JSON.stringify(input.outputKeywords ?? []), input.id, input.ownerId],
    );

    return input.id;
  }

  const examSetId = createId('set');
  await dbRun(
    `INSERT INTO exam_sets (
      id, owner_id, title, summary, status, prompt_text, selected_shortcut_id, custom_prompt, output_keywords_json, config_json, questions_json,
      source_image_data_url, source_image_data_urls_json, source_images_json, source_notes, published_at, created_at, updated_at
     ) VALUES (?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)`,
    [
      examSetId,
      input.ownerId,
      input.title,
      input.summary,
      input.customPrompt ?? '',
      input.selectedShortcutId,
      input.customPrompt ?? null,
      JSON.stringify(input.outputKeywords ?? []),
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
  return toNullableNumber(row?.generate_count ?? null) ?? 0;
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

  const examSets = examSetRows.map(parseExamSet);
  const examSetIds = examSets.map((item) => item.id);
  if (examSetIds.length > 0) {
    const placeholders = examSetIds.map(() => '?').join(', ');
    const logRows = await dbAll<OpenAiLogRow>(
      `SELECT * FROM openai_logs
       WHERE user_id = ? AND exam_set_id IN (${placeholders})
       ORDER BY created_at DESC`,
      [userId, ...examSetIds],
    );
    const logsByExamSetId = new Map<string, OpenAiLogRecord[]>();
    for (const row of logRows) {
      if (!row.exam_set_id) {
        continue;
      }
      const parsed = parseOpenAiLog(row);
      const current = logsByExamSetId.get(row.exam_set_id) ?? [];
      current.push(parsed);
      logsByExamSetId.set(row.exam_set_id, current);
    }

    for (const examSet of examSets) {
      if (examSet.outputKeywords.length > 0) {
        continue;
      }
      const logs = logsByExamSetId.get(examSet.id) ?? [];
      if (logs.length === 0) {
        continue;
      }
      const examSetQuestionsSignature = JSON.stringify(examSet.questions);
      let selectedLog: OpenAiLogRecord | null = null;
      if (examSet.status === 'published') {
        selectedLog =
          logs.find((log) => extractQuestionsSignatureFromResponseJson(log.responseJson) === examSetQuestionsSignature) ?? null;
      }
      if (!selectedLog) {
        selectedLog = logs[0] ?? null;
      }
      if (!selectedLog) {
        continue;
      }
      const fallbackKeywords = extractOutputKeywordsFromResponseJson(selectedLog.responseJson);
      if (fallbackKeywords && fallbackKeywords.length > 0) {
        examSet.outputKeywords = fallbackKeywords;
      }
    }
  }

  return {
    examSets,
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
  correlationId?: string | null;
  model: string;
  route?: string | null;
  status?: 'success' | 'failed';
  errorType?: string | null;
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
     id, user_id, exam_set_id, correlation_id, model, route, status, error_type, prompt_text, response_text, response_json,
      latency_ms, input_tokens, output_tokens, total_tokens, estimated_cost_usd, created_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.userId,
      input.examSetId ?? null,
      input.correlationId ?? null,
      input.model,
      input.route ?? null,
      input.status ?? 'success',
      input.errorType ?? null,
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

export async function createAdminCleanupRun(input: {
  runType: 'scheduled' | 'manual';
  status: 'success' | 'failed';
  triggeredBy?: string | null;
  dryRun: boolean;
  orphanCount: number;
  removedCount: number;
  failedCount: number;
  durationMs?: number | null;
  errorMessage?: string | null;
}) {
  const id = createId('clrun');
  const now = new Date().toISOString();
  await dbRun(
    `INSERT INTO admin_cleanup_runs (
      id, run_type, status, triggered_by, dry_run, orphan_count, removed_count, failed_count,
      duration_ms, error_message, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.runType,
      input.status,
      input.triggeredBy ?? null,
      input.dryRun ? 1 : 0,
      input.orphanCount,
      input.removedCount,
      input.failedCount,
      input.durationMs ?? null,
      input.errorMessage ?? null,
      now,
    ],
  );
  return id;
}

export async function listAdminCleanupRuns(limit = 30): Promise<AdminCleanupRunRecord[]> {
  const rows = await dbAll<AdminCleanupRunRow>(
    `SELECT * FROM admin_cleanup_runs
     ORDER BY created_at DESC
     LIMIT ?`,
    [limit],
  );
  return rows.map(parseAdminCleanupRun);
}

export async function listRecentCleanupJobs(limit = 30) {
  const rows = await dbAll<CleanupJobRow>(
    `SELECT * FROM cleanup_jobs
     ORDER BY updated_at DESC
     LIMIT ?`,
    [limit],
  );
  return rows.map(parseCleanupJob);
}

export async function listAdminUserSummaries(limit = 100) {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const rows = await dbAll<{
    user_id: string;
    email: string;
    created_at: string;
    status: string;
    recent_request_count: number | string;
    recent_attempt_count: number | string;
  }>(
    `SELECT
       u.id as user_id,
       u.email as email,
       u.created_at as created_at,
       COALESCE(
         (
          SELECT CASE
            WHEN EXISTS (
              SELECT 1 FROM user_admin_events e
              WHERE e.user_id = u.id AND e.action = 'suspend'
            ) THEN 'suspended'
            ELSE 'active'
          END
         ),
         'active'
       ) as status,
       (SELECT COUNT(*) FROM openai_logs l WHERE l.user_id = u.id AND l.created_at >= ?) as recent_request_count,
       (SELECT COUNT(*) FROM attempts a WHERE a.user_id = u.id AND a.updated_at >= ?) as recent_attempt_count
     FROM users u
     ORDER BY u.created_at DESC
     LIMIT ?`,
    [since, since, limit],
  );

  return rows.map((row) => ({
    userId: row.user_id,
    email: row.email,
    createdAt: row.created_at,
    status: row.status === 'suspended' ? 'suspended' : 'active',
    recentRequestCount: Number(row.recent_request_count),
    recentAttemptCount: Number(row.recent_attempt_count),
  }));
}

export async function suspendUser(input: { userId: string; actorId: string; reason?: string | null }) {
  const id = createId('uae');
  const now = new Date().toISOString();
  await dbRun(
    `INSERT INTO user_admin_events (id, user_id, action, reason, actor_id, created_at)
     VALUES (?, ?, 'suspend', ?, ?, ?)`,
    [id, input.userId, input.reason ?? null, input.actorId, now],
  );
}

export async function listRecentFeedback(limit = 50) {
  const rows = await dbAll<{
    id: string;
    user_id: string | null;
    category: string;
    message: string;
    status: string;
    created_at: string;
  }>(
    `SELECT * FROM user_feedback
     ORDER BY created_at DESC
     LIMIT ?`,
    [limit],
  );

  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    category: row.category,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
  }));
}
