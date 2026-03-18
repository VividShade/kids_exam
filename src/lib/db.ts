import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import { createClient, type Client as LibsqlClient, type InValue } from '@libsql/client';
import Database from 'better-sqlite3';

import { env, isTursoConfigured } from '@/lib/env';

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
];

let initPromise: Promise<void> | null = null;
let tursoClient: LibsqlClient | null = null;
let localDb: Database.Database | null = null;

function getTursoClient() {
  if (!tursoClient) {
    tursoClient = createClient({
      url: env.tursoUrl,
      authToken: env.tursoAuthToken || undefined,
    });
  }

  return tursoClient;
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

async function initialize() {
  if (initPromise) {
    await initPromise;
    return;
  }

  initPromise = (async () => {
    if (isTursoConfigured) {
      const client = getTursoClient();
      for (const statement of schemaStatements) {
        await client.execute(statement);
      }
      return;
    }

    const db = getLocalDb();
    for (const statement of schemaStatements) {
      db.exec(statement);
    }
  })();

  await initPromise;
}

export async function dbAll<T extends Row>(sql: string, args: SqlValue[] = []) {
  await initialize();

  if (isTursoConfigured) {
    const result = await getTursoClient().execute({ sql, args: args as InValue[] });
    return result.rows as T[];
  }

  return getLocalDb().prepare(sql).all(...args) as T[];
}

export async function dbGet<T extends Row>(sql: string, args: SqlValue[] = []) {
  const rows = await dbAll<T>(sql, args);
  return rows[0] ?? null;
}

export async function dbRun(sql: string, args: SqlValue[] = []) {
  await initialize();

  if (isTursoConfigured) {
    await getTursoClient().execute({ sql, args: args as InValue[] });
    return;
  }

  getLocalDb().prepare(sql).run(...args);
}
