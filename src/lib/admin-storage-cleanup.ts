import 'server-only';

import { listAllStoragePaths } from '@/lib/storage';
import { listReferencedStoragePaths } from '@/lib/repository';

export async function scanOrphanStoragePaths() {
  const [allPaths, referencedPaths] = await Promise.all([listAllStoragePaths(), listReferencedStoragePaths()]);
  const referencedSet = new Set(referencedPaths);
  const orphanPaths = allPaths.filter((path) => !referencedSet.has(path));

  return {
    allPaths,
    referencedPaths,
    orphanPaths,
  };
}

export function getNextHourlyScheduleIso(now = new Date()) {
  const next = new Date(now);
  next.setUTCMinutes(0, 0, 0);
  next.setUTCHours(next.getUTCHours() + 1);
  return next.toISOString();
}
