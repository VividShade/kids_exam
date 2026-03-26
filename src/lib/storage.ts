import 'server-only';

import { createClient } from '@supabase/supabase-js';

import { env, isSupabaseStorageConfigured } from '@/lib/env';
import type { ExamSourceImage } from '@/lib/types';

type UploadInput = {
  originalBase64: string;
  thumbnailBase64: string;
  width: number;
  height: number;
  thumbWidth: number;
  thumbHeight: number;
  sizeBytes: number;
};

let storageClient: ReturnType<typeof createClient> | null = null;

function getStorageClient() {
  if (!isSupabaseStorageConfigured) {
    throw new Error('Supabase Storage is not configured.');
  }

  if (!storageClient) {
    storageClient = createClient(env.supabaseUrl, env.supabaseSecretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return storageClient;
}

function toBuffer(base64: string) {
  return Buffer.from(base64, 'base64');
}

export async function uploadExamSourceImages(userId: string, uploads: UploadInput[]) {
  const client = getStorageClient();
  const uploadedAt = new Date().toISOString();

  const results: ExamSourceImage[] = [];
  for (const upload of uploads) {
    const id = crypto.randomUUID();
    const originalPath = `users/${userId}/sources/${id}/original.jpg`;
    const thumbnailPath = `users/${userId}/sources/${id}/thumb.jpg`;

    const originalBytes = toBuffer(upload.originalBase64);
    const thumbnailBytes = toBuffer(upload.thumbnailBase64);

    const originalResult = await client.storage.from(env.supabaseStorageBucket).upload(originalPath, originalBytes, {
      contentType: 'image/jpeg',
      upsert: false,
    });
    if (originalResult.error) {
      throw new Error(`Failed to upload original image: ${originalResult.error.message}`);
    }

    const thumbnailResult = await client.storage.from(env.supabaseStorageBucket).upload(thumbnailPath, thumbnailBytes, {
      contentType: 'image/jpeg',
      upsert: false,
    });
    if (thumbnailResult.error) {
      throw new Error(`Failed to upload thumbnail image: ${thumbnailResult.error.message}`);
    }

    results.push({
      id,
      originalPath,
      thumbnailPath,
      width: upload.width,
      height: upload.height,
      thumbWidth: upload.thumbWidth,
      thumbHeight: upload.thumbHeight,
      sizeBytes: upload.sizeBytes,
      uploadedAt,
    });
  }

  return results;
}

export async function createSignedImageUrl(path: string, expiresInSeconds = 60 * 60) {
  const client = getStorageClient();
  const result = await client.storage.from(env.supabaseStorageBucket).createSignedUrl(path, expiresInSeconds);
  if (result.error || !result.data?.signedUrl) {
    return null;
  }
  return result.data.signedUrl;
}

export async function deleteStoragePaths(paths: string[]) {
  if (paths.length === 0) {
    return;
  }

  const client = getStorageClient();
  const result = await client.storage.from(env.supabaseStorageBucket).remove(paths);
  if (result.error) {
    throw new Error(result.error.message);
  }
}

async function listDirectoryPaths(prefix: string): Promise<string[]> {
  const client = getStorageClient();
  const results: string[] = [];
  let offset = 0;
  const pageSize = 100;

  while (true) {
    const { data, error } = await client.storage.from(env.supabaseStorageBucket).list(prefix, { limit: pageSize, offset });
    if (error) {
      throw new Error(error.message);
    }
    if (!data || data.length === 0) {
      break;
    }

    for (const entry of data) {
      const fullPath = prefix ? `${prefix}/${entry.name}` : entry.name;
      const hasMetadata = !!entry.metadata;
      if (hasMetadata) {
        results.push(fullPath);
      } else {
        const nested = await listDirectoryPaths(fullPath);
        results.push(...nested);
      }
    }

    if (data.length < pageSize) {
      break;
    }
    offset += pageSize;
  }

  return results;
}

export async function listAllStoragePaths() {
  return listDirectoryPaths('');
}
