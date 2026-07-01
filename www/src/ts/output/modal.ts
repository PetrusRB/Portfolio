import { sanitizeHtml } from "../render/sanitize";

type ModalType = "error" | "success" | "warning" | "info";

interface ModalOptions {
  type: ModalType;
  title?: string;
  message: string;
  buttonLabel?: string;
}

const icons: Record<ModalType, string> = {
  error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`,
  warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
};

const titles: Record<ModalType, string> = {
  error: "Erro",
  success: "Sucesso",
  warning: "Aviso",
  info: "Info",
};

export function showModal(options: ModalOptions): void {
  const existing = document.querySelector(".modal-overlay");
  if (existing) existing.remove();

  const { type, message, buttonLabel = "Entendido" } = options;
  const title = options.title ?? titles[type];

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";

  const card = document.createElement("div");
  card.className = `modal modal-${type}`;

  const icon = document.createElement("div");
  icon.className = "modal-icon";
  icon.innerHTML = icons[type];

  const titleEl = document.createElement("h3");
  titleEl.className = "modal-title";
  titleEl.textContent = title;

  const text = document.createElement("p");
  text.className = "modal-message";
  text.textContent = message;

  const btn = document.createElement("button");
  btn.className = `btn modal-btn modal-btn-${type}`;
  btn.textContent = buttonLabel;

  card.append(icon, titleEl, text, btn);
  overlay.appendChild(card);

  const close = () => overlay.remove();
  btn.addEventListener("click", close);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  document.body.appendChild(overlay);
}
