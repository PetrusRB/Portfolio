interface GitHubRepo {
    name: string;
    description: string | null;
    html_url: string;
    language: string | null;
    stargazers_count: number;
}
interface CacheEntry {
    data: GitHubRepo[];
    etag: string | null;
    timestamp: number;
}
declare const CACHE_KEY = "github_repos";
declare const CACHE_TTL: number;
declare function getCache(): CacheEntry | null;
declare function setCache(data: GitHubRepo[], etag: string | null): void;
declare function isCacheValid(entry: CacheEntry): boolean;
declare function fetchRepos(): Promise<GitHubRepo[]>;
declare function createRepoCard(repo: GitHubRepo): HTMLElement;
declare let reposLoaded: boolean;
declare function loadRepos(): Promise<void>;
declare const projectsSection: HTMLElement | null;
declare function runTypewriter(el: HTMLElement, speed?: number): void;
declare const STORAGE_KEY = "theme";
declare function getPreferredTheme(): "light" | "dark";
declare function applyTheme(theme: "light" | "dark"): void;
