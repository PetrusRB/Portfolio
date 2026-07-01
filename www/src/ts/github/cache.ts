import type { GitHubRepo } from "./schema";

interface CacheEntry {
  data: GitHubRepo[];
  etag: string | null;
  timestamp: number;
}

const CACHE_KEY = "github_repos";
export const CACHE_TTL = 10 * 60 * 1000;

export function getCache(): CacheEntry | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCache(data: GitHubRepo[], etag: string | null): void {
  const entry: CacheEntry = { data, etag, timestamp: Date.now() };
  localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
}

export function isCacheValid(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp < CACHE_TTL;
}
