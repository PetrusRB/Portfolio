import type { GitHubRepo } from "../github/schema";
import { sanitizeHtml, sanitizeUrl } from "./sanitize";
import { useState } from "../state";
import { useQuery } from "../query";
import { showErrorModal } from "../output/errors.ts";

const PER_PAGE = 6;

const pageState = useState(0);
const reposQuery = useQuery(async () => {
  const { getCachedRepos, fetchRepos } = await import("../github/api");
  const cached = getCachedRepos();
  if (cached) return cached;
  return fetchRepos();
});

function createRepoCard(repo: GitHubRepo): HTMLElement {
  const card = document.createElement("article");
  card.className = "project-card";

  const langTag = repo.language
    ? `<span class="tag">${sanitizeHtml(repo.language)}</span>`
    : "";

  card.innerHTML = `
    <h3>${sanitizeHtml(repo.name)}</h3>
    <p>${sanitizeHtml(repo.description || "Sem descrição")}</p>
    <p class="project-link">
      <span>Github:</span>
      <a target="_blank" href="${sanitizeUrl(repo.html_url)}">${sanitizeHtml(repo.html_url.replace("https://github.com/", ""))}</a>
    </p>
    <div class="tags">
      ${langTag}
      ${repo.stargazers_count > 0 ? `<span class="tag">⭐ ${repo.stargazers_count}</span>` : ""}
    </div>
  `;

  return card;
}

function createSkeleton(): HTMLElement {
  const card = document.createElement("article");
  card.className = "project-card skeleton";

  const title = document.createElement("div");
  title.className = "sk-title";

  const text1 = document.createElement("div");
  text1.className = "sk-text";

  const text2 = document.createElement("div");
  text2.className = "sk-text sk-short";

  const tags = document.createElement("div");
  tags.className = "sk-tags";
  tags.append(createEl("sk-tag"), createEl("sk-tag"));

  card.append(title, text1, text2, tags);
  return card;
}

function createEl(className: string): HTMLElement {
  const el = document.createElement("div");
  el.className = className;
  return el;
}

let currentData: GitHubRepo[] | null = null;

function renderPage(): void {
  const container = document.getElementById("repos");
  const loadMoreBtn = document.getElementById("load-more");
  if (!container || !loadMoreBtn || !currentData) return;

  const start = pageState.get() * PER_PAGE;
  const page = currentData.slice(start, start + PER_PAGE);

  page.forEach((repo) => container.appendChild(createRepoCard(repo)));

  const hasMore = start + PER_PAGE < currentData.length;
  loadMoreBtn.style.display = hasMore ? "inline-flex" : "none";
}

function renderSkeletons(): HTMLElement[] {
  return [createSkeleton(), createSkeleton(), createSkeleton()];
}

function render(): void {
  const container = document.getElementById("repos");
  const loadMoreBtn = document.getElementById("load-more");
  if (!container) return;

  if (reposQuery.loading) {
    container.replaceChildren(...renderSkeletons());
    if (loadMoreBtn) loadMoreBtn.style.display = "none";
    return;
  }

  if (reposQuery.error) {
    container.replaceChildren();
    showErrorModal(reposQuery.error);
    if (loadMoreBtn) loadMoreBtn.style.display = "none";
    return;
  }

  currentData = reposQuery.data;
  pageState.set(0);
  container.replaceChildren();
  renderPage();
}

export function initProjects(): void {
  reposQuery.subscribe(render);

  document.getElementById("load-more")?.addEventListener("click", () => {
    pageState.set((p) => p + 1);
    renderPage();
  });

  const section = document.getElementById("projects");
  if (!section) return;

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        reposQuery.refetch();
        observer.disconnect();
      }
    },
    { rootMargin: "200px" },
  );
  observer.observe(section);
}
