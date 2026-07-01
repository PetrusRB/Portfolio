// === GITHUB CACHE ===
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

const CACHE_KEY = "github_repos";
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function getCache(): CacheEntry | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setCache(data: GitHubRepo[], etag: string | null): void {
  const entry: CacheEntry = { data, etag, timestamp: Date.now() };
  localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
}

function isCacheValid(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp < CACHE_TTL;
}

async function fetchRepos(): Promise<GitHubRepo[]> {
  const cached = getCache();
  const headers: Record<string, string> = {};

  if (cached?.etag) {
    headers["If-None-Match"] = cached.etag;
  }

  const res = await fetch(
    `https://api.github.com/users/PetrusRB/repos?sort=updated&per_page=10`,
    { headers },
  );

  if (res.status === 304 && cached) {
    // Data unchanged — refresh timestamp only
    setCache(cached.data, cached.etag);
    return cached.data;
  }

  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

  const etag = res.headers.get("ETag");
  const data: GitHubRepo[] = await res.json();
  setCache(data, etag);
  return data;
}

// === LAZY LOADING ===
function createRepoCard(repo: GitHubRepo): HTMLElement {
  const card = document.createElement("article");
  card.className = "project-card";

  const langTag = repo.language
    ? `<span class="tag">${repo.language}</span>`
    : "";

  card.innerHTML = `
    <h3>${repo.name}</h3>
    <p>${repo.description || "Sem descrição"}</p>
    <p class="project-link">
      <span>Github:</span>
      <a target="_blank" href="${repo.html_url}">${repo.html_url.replace("https://github.com/", "")}</a>
    </p>
    <div class="tags">
      ${langTag}
      ${repo.stargazers_count > 0 ? `<span class="tag">⭐ ${repo.stargazers_count}</span>` : ""}
    </div>
  `;

  return card;
}

let reposLoaded = false;

async function loadRepos(): Promise<void> {
  if (reposLoaded) return;
  reposLoaded = true;

  const container = document.getElementById("repos");
  if (!container) return;

  const cached = getCache();
  if (cached && isCacheValid(cached)) {
    container.innerHTML = "";
    cached.data.forEach((repo) => container.appendChild(createRepoCard(repo)));
    return;
  }

  try {
    const repos = await fetchRepos();
    container.innerHTML = "";
    repos.forEach((repo) => container.appendChild(createRepoCard(repo)));
  } catch (err) {
    console.error("Erro ao carregar repositórios:", err);
    container.innerHTML = "<p>Erro ao carregar projetos do GitHub.</p>";
  }
}

const projectsSection = document.getElementById("projects");
if (projectsSection) {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        loadRepos();
        observer.disconnect();
      }
    },
    { rootMargin: "200px" },
  );
  observer.observe(projectsSection);
}

// === TYPEWRITER ===
function runTypewriter(el: HTMLElement, speed: number = 55): void {
  const text: string = el.dataset.text || "";
  let i: number = 0;

  function type(): void {
    if (i <= text.length) {
      el.textContent = text.slice(0, i);
      i += 1;
      setTimeout(type, speed);
    } else {
      el.classList.add("done");
    }
  }

  type();
}

document
  .querySelectorAll<HTMLElement>(".typewriter")
  .forEach((el) => runTypewriter(el));

// === THEME TOGGLE ===
const STORAGE_KEY = "theme";

function getPreferredTheme(): "light" | "dark" {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function applyTheme(theme: "light" | "dark"): void {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  localStorage.setItem(STORAGE_KEY, theme);
}

applyTheme(getPreferredTheme());

document.querySelector(".theme-toggle")?.addEventListener("click", () => {
  const current = document.documentElement.classList.contains("light")
    ? "light"
    : "dark";
  applyTheme(current === "light" ? "dark" : "light");
});
