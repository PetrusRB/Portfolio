import { initProjects } from "./render/cards";
import { initTheme } from "./theme";
import { initTypewriter } from "./typewriter";
import { showModal } from "./output/modal";

initTheme();
initTypewriter();
initProjects();

// document.getElementById("test-error")?.addEventListener("click", () => {
//   showModal({
//     type: "success",
//     message: "Shitty pants. :D",
//   });
// });
