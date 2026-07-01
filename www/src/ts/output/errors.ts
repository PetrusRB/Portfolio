import { showModal } from "./modal";

export function showErrorModal(message: string): void {
  showModal({ type: "error", message });
}
