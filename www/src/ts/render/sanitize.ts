import DOMPurify from "dompurify";

export function sanitizeHtml(str: string): string {
  return DOMPurify.sanitize(str, { ALLOWED_TAGS: [] });
}

export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") return url;
  } catch {}
  return "#";
}
