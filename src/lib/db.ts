import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import Database from 'better-sqlite3';
import postgres, { type Sql } from 'postgres';

import { env, isSupabaseConfigured } from '@/lib/env';

type SqlValue = string | number | null;
type Row = Record<string, unknown>;

const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    image TEXT,
    provider TEXT,
    provider_account_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS exam_sets (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    status TEXT NOT NULL,
    prompt_text TEXT NOT NULL,
    config_json TEXT NOT NULL,
    questions_json TEXT NOT NULL,
    source_image_data_url TEXT,
    source_image_data_urls_json TEXT,
    source_images_json TEXT,
    source_notes TEXT,
    published_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(owner_id) REFERENCES users(id)
  )`,
  `CREATE INDEX IF NOT EXISTS exam_sets_owner_idx ON exam_sets(owner_id, updated_at DESC)`,
  `CREATE TABLE IF NOT EXISTS attempts (
    id TEXT PRIMARY KEY,
    exam_set_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    status TEXT NOT NULL,
    answers_json TEXT NOT NULL,
    current_index INTEGER NOT NULL DEFAULT 0,
    score INTEGER,
    wrong_question_ids_json TEXT NOT NULL,
    started_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    completed_at TEXT,
    abandoned_at TEXT,
    FOREIGN KEY(exam_set_id) REFERENCES exam_sets(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`,
  `CREATE INDEX IF NOT EXISTS attempts_user_idx ON attempts(user_id, updated_at DESC)`,
  `CREATE INDEX IF NOT EXISTS attempts_exam_idx ON attempts(exam_set_id, updated_at DESC)`,
  `CREATE TABLE IF NOT EXISTS openai_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    exam_set_id TEXT,
    model TEXT NOT NULL,
    prompt_text TEXT NOT NULL,
    response_text TEXT,
    response_json TEXT,
    latency_ms INTEGER,
    input_tokens INTEGER,
    output_tokens INTEGER,
    total_tokens INTEGER,
    estimated_cost_usd REAL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(exam_set_id) REFERENCES exam_sets(id)
  )`,
  `CREATE INDEX IF NOT EXISTS openai_logs_user_idx ON openai_logs(user_id, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS openai_logs_exam_idx ON openai_logs(exam_set_id, created_at DESC)`,
];

let initPromise: Promise<void> | null = null;
let localDb: Database.Database | null = null;
let supabaseSql: Sql | null = null;

function getSupabaseClient() {
  if (!supabaseSql) {
    supabaseSql = postgres(env.supabaseDbUrl, {
      ssl: 'require',
      max: 1,
      prepare: false,
    });
  }

  return supabaseSql;
}

function getLocalDb() {
  if (!localDb) {
    const absolutePath = path.isAbsolute(env.localDbPath)
      ? env.localDbPath
      : path.join(process.cwd(), env.localDbPath);

    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    localDb = new Database(absolutePath);
    localDb.pragma('journal_mode = WAL');
  }

  return localDb;
}

function toPostgresPlaceholders(statement: string) {
  let index = 0;
  return statement.replace(/\?/g, () => `$${++index}`);
}

async function initialize() {
  if (initPromise) {
    await initPromise;
    return;
  }

  initPromise = (async () => {
    if (isSupabaseConfigured) {
      const client = getSupabaseClient();
      for (const statement of schemaStatements) {
        await client.unsafe(statement);
      }
      await client.unsafe('ALTER TABLE exam_sets ADD COLUMN IF NOT EXISTS source_image_data_urls_json TEXT');
      await client.unsafe('ALTER TABLE exam_sets ADD COLUMN IF NOT EXISTS source_images_json TEXT');
      return;
    }

    const db = getLocalDb();
    for (const statement of schemaStatements) {
      db.exec(statement);
    }
    const columns = db.prepare('PRAGMA table_info(exam_sets)').all() as Array<{ name: string }>;
    const hasSourceImageDataUrlsJson = columns.some((column) => column.name === 'source_image_data_urls_json');
    if (!hasSourceImageDataUrlsJson) {
      db.exec('ALTER TABLE exam_sets ADD COLUMN source_image_data_urls_json TEXT');
    }
    const hasSourceImagesJson = columns.some((column) => column.name === 'source_images_json');
    if (!hasSourceImagesJson) {
      db.exec('ALTER TABLE exam_sets ADD COLUMN source_images_json TEXT');
    }
  })();

  await initPromise;
}

export async function dbAll<T extends Row>(sql: string, args: SqlValue[] = []) {
  await initialize();

  if (isSupabaseConfigured) {
    const result = await getSupabaseClient().unsafe(toPostgresPlaceholders(sql), args);
    return (result as unknown) as T[];
  }

  return getLocalDb().prepare(sql).all(...args) as T[];
}

export async function dbGet<T extends Row>(sql: string, args: SqlValue[] = []) {
  const rows = await dbAll<T>(sql, args);
  return rows[0] ?? null;
}

export async function dbRun(sql: string, args: SqlValue[] = []) {
  await initialize();

  if (isSupabaseConfigured) {
    await getSupabaseClient().unsafe(toPostgresPlaceholders(sql), args);
    return;
  }

  getLocalDb().prepare(sql).run(...args);
}
