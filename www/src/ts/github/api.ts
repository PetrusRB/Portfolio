import type { GitHubRepo } from "./schema";
import { GitHubRepoArraySchema } from "./schema";
import { getCache, setCache } from "./cache";

export async function fetchAllRepos(): Promise<GitHubRepo[]> {
  const cached = getCache();
  const headers: Record<string, string> = {};

  if (cached?.etag) {
    headers["If-None-Match"] = cached.etag;
  }

  const res = await fetch(
    `https://api.github.com/users/PetrusRB/repos?sort=updated&per_page=30`,
    { headers },
  );

  if (res.status === 304 && cached) {
    setCache(cached.data, cached.etag);
    return cached.data;
  }

  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

  const etag = res.headers.get("ETag");
  const json = await res.json();
  const data = GitHubRepoArraySchema.parse(json);
  setCache(data, etag);
  return data;
}
