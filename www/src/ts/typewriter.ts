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

export function initTypewriter(): void {
  document
    .querySelectorAll<HTMLElement>(".typewriter")
    .forEach((el) => runTypewriter(el));
}
