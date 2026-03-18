import 'server-only';

import { createId } from '@/lib/id';
import { dbAll, dbGet, dbRun } from '@/lib/db';
import type { AttemptRecord, DashboardData, ExamBuilderConfig, ExamQuestion, ExamSetRecord } from '@/lib/types';

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
  config_json: string;
  questions_json: string;
  source_image_data_url: string | null;
  source_notes: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

type AttemptRow = {
  id: string;
  exam_set_id: string;
  user_id: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  answers_json: string;
  current_index: number;
  score: number | null;
  wrong_question_ids_json: string;
  started_at: string;
  updated_at: string;
  completed_at: string | null;
  abandoned_at: string | null;
};

function parseExamSet(row: ExamSetRow): ExamSetRecord {
  return {
    id: row.id,
    ownerId: row.owner_id,
    title: row.title,
    summary: row.summary,
    status: row.status,
    promptText: row.prompt_text,
    config: JSON.parse(row.config_json) as ExamBuilderConfig,
    questions: JSON.parse(row.questions_json) as ExamQuestion[],
    sourceImageDataUrl: row.source_image_data_url,
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
    answers: JSON.parse(row.answers_json) as Record<string, string>,
    currentIndex: row.current_index,
    score: row.score,
    wrongQuestionIds: JSON.parse(row.wrong_question_ids_json) as string[],
    startedAt: row.started_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
    abandonedAt: row.abandoned_at,
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
  promptText: string;
  config: ExamBuilderConfig;
  questions: ExamQuestion[];
  sourceImageDataUrl?: string | null;
  sourceNotes?: string | null;
}) {
  const now = new Date().toISOString();

  if (input.id) {
    await dbRun(
      `UPDATE exam_sets
       SET title = ?, summary = ?, prompt_text = ?, config_json = ?, questions_json = ?, source_image_data_url = ?, source_notes = ?, updated_at = ?
       WHERE id = ? AND owner_id = ?`,
      [
        input.title,
        input.summary,
        input.promptText,
        JSON.stringify(input.config),
        JSON.stringify(input.questions),
        input.sourceImageDataUrl ?? null,
        input.sourceNotes ?? null,
        now,
        input.id,
        input.ownerId,
      ],
    );

    return input.id;
  }

  const examSetId = createId('set');
  await dbRun(
    `INSERT INTO exam_sets (
      id, owner_id, title, summary, status, prompt_text, config_json, questions_json,
      source_image_data_url, source_notes, published_at, created_at, updated_at
     ) VALUES (?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?, NULL, ?, ?)`,
    [
      examSetId,
      input.ownerId,
      input.title,
      input.summary,
      input.promptText,
      JSON.stringify(input.config),
      JSON.stringify(input.questions),
      input.sourceImageDataUrl ?? null,
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

export async function createOrResumeAttempt(examSetId: string, userId: string) {
  const existing = await getActiveAttemptForUser(examSetId, userId);
  if (existing) {
    return existing;
  }

  const now = new Date().toISOString();
  const id = createId('attempt');

  await dbRun(
    `INSERT INTO attempts (
      id, exam_set_id, user_id, status, answers_json, current_index, score,
      wrong_question_ids_json, started_at, updated_at, completed_at, abandoned_at
     ) VALUES (?, ?, ?, 'in_progress', '{}', 0, NULL, '[]', ?, ?, NULL, NULL)`,
    [id, examSetId, userId, now, now],
  );

  const created = await getAttemptById(id, userId);
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
