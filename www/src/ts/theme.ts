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

export function initTheme(): void {
  applyTheme(getPreferredTheme());

  document.querySelector(".theme-toggle")?.addEventListener("click", () => {
    const current = document.documentElement.classList.contains("light")
      ? "light"
      : "dark";
    applyTheme(current === "light" ? "dark" : "light");
  });
}
