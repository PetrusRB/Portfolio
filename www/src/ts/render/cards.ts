import type { GitHubRepo } from "../github/schema";
import { escapeHtml, sanitizeUrl } from "./sanitize";

const PER_PAGE = 6;

let allRepos: GitHubRepo[] = [];
let currentPage = 0;

export function setRepos(repos: GitHubRepo[]): void {
  allRepos = repos;
  currentPage = 0;
}

export function createRepoCard(repo: GitHubRepo): HTMLElement {
  const card = document.createElement("article");
  card.className = "project-card";

  const langTag = repo.language
    ? `<span class="tag">${escapeHtml(repo.language)}</span>`
    : "";

  const name = escapeHtml(repo.name);
  const desc = escapeHtml(repo.description || "Sem descrição");
  const url = sanitizeUrl(repo.html_url);
  const label = escapeHtml(repo.html_url.replace("https://github.com/", ""));

  card.innerHTML = `
    <h3>${name}</h3>
    <p>${desc}</p>
    <p class="project-link">
      <span>Github:</span>
      <a target="_blank" href="${url}">${label}</a>
    </p>
    <div class="tags">
      ${langTag}
      ${repo.stargazers_count > 0 ? `<span class="tag">⭐ ${repo.stargazers_count}</span>` : ""}
    </div>
  `;

  return card;
}

function renderSkeletons(): string {
  return `
    <article class="project-card skeleton">
      <div class="sk-title"></div>
      <div class="sk-text"></div>
      <div class="sk-text sk-short"></div>
      <div class="sk-tags"><div class="sk-tag"></div><div class="sk-tag"></div></div>
    </article>
    <article class="project-card skeleton">
      <div class="sk-title"></div>
      <div class="sk-text"></div>
      <div class="sk-text sk-short"></div>
      <div class="sk-tags"><div class="sk-tag"></div><div class="sk-tag"></div></div>
    </article>
    <article class="project-card skeleton">
      <div class="sk-title"></div>
      <div class="sk-text"></div>
      <div class="sk-text sk-short"></div>
      <div class="sk-tags"><div class="sk-tag"></div><div class="sk-tag"></div></div>
    </article>
  `;
}

function showErrorModal(message: string): void {
  const existing = document.getElementById("error-modal");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.id = "error-modal";
  overlay.className = "error-modal-overlay";
  overlay.innerHTML = `
    <div class="error-modal">
      <div class="error-modal-icon">!</div>
      <p>${escapeHtml(message)}</p>
      <button class="btn btn-primary error-modal-close">Entendido</button>
    </div>
  `;

  overlay.querySelector(".error-modal-close")?.addEventListener("click", () => {
    overlay.remove();
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });

  document.body.appendChild(overlay);
}

export function renderPage(): void {
  const container = document.getElementById("repos");
  const loadMoreBtn = document.getElementById("load-more");
  if (!container || !loadMoreBtn) return;

  const start = currentPage * PER_PAGE;
  const page = allRepos.slice(start, start + PER_PAGE);

  page.forEach((repo) => container.appendChild(createRepoCard(repo)));

  const hasMore = start + PER_PAGE < allRepos.length;
  loadMoreBtn.style.display = hasMore ? "inline-flex" : "none";
}

export function nextPage(): void {
  currentPage++;
  renderPage();
}

export async function loadRepos(): Promise<void> {
  const { getCache, isCacheValid } = await import("../github/cache");
  const { fetchAllRepos } = await import("../github/api");

  const container = document.getElementById("repos");
  const loadMoreBtn = document.getElementById("load-more");
  if (!container) return;

  const cached = getCache();
  if (cached && isCacheValid(cached)) {
    setRepos(cached.data);
    container.innerHTML = "";
    renderPage();
    return;
  }

  container.innerHTML = renderSkeletons();
  if (loadMoreBtn) loadMoreBtn.style.display = "none";

  try {
    setRepos(await fetchAllRepos());
    container.innerHTML = "";
    renderPage();
  } catch (err) {
    console.error("Erro ao carregar repositórios:", err);
    container.innerHTML = "";
    showErrorModal(
      err instanceof Error
        ? `Falha ao carregar projetos: ${err.message}`
        : "Falha ao carregar projetos do GitHub. Tente novamente mais tarde.",
    );
    if (loadMoreBtn) loadMoreBtn.style.display = "none";
  }
}

export function initProjects(): void {
  document.getElementById("load-more")?.addEventListener("click", nextPage);

  const section = document.getElementById("projects");
  if (!section) return;

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        loadRepos();
        observer.disconnect();
      }
    },
    { rootMargin: "200px" },
  );
  observer.observe(section);
}
