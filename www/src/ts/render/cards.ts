import type { GitHubRepo } from "../github/schema";
import { sanitizeHtml, sanitizeUrl } from "./sanitize";

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
    ? `<span class="tag">${sanitizeHtml(repo.language)}</span>`
    : "";

  const name = sanitizeHtml(repo.name);
  const desc = sanitizeHtml(repo.description || "Sem descrição");
  const url = sanitizeUrl(repo.html_url);
  const label = sanitizeHtml(repo.html_url.replace("https://github.com/", ""));

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

function renderSkeletons(): HTMLElement[] {
  return [createSkeleton(), createSkeleton(), createSkeleton()];
}

function showErrorModal(message: string): void {
  const existing = document.getElementById("error-modal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.className = "error-modal";

  const icon = document.createElement("div");
  icon.className = "error-modal-icon";
  icon.textContent = "!";

  const text = document.createElement("p");
  text.textContent = message;

  const btn = document.createElement("button");
  btn.className = "btn btn-primary error-modal-close";
  btn.textContent = "Entendido";

  modal.append(icon, text, btn);

  const overlay = document.createElement("div");
  overlay.id = "error-modal";
  overlay.className = "error-modal-overlay";
  overlay.appendChild(modal);

  btn.addEventListener("click", () => overlay.remove());
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
    container.replaceChildren();
    renderPage();
    return;
  }

  container.replaceChildren(...renderSkeletons());
  if (loadMoreBtn) loadMoreBtn.style.display = "none";

  try {
    setRepos(await fetchAllRepos());
    container.replaceChildren();
    renderPage();
  } catch (err) {
    console.error("Erro ao carregar repositórios:", err);
    container.replaceChildren();
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
