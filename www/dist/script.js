"use strict";
function runTypewriter(el, speed = 55) {
    const text = el.dataset.text || "";
    let i = 0;
    function type() {
        if (i <= text.length) {
            el.textContent = text.slice(0, i);
            i += 1;
            setTimeout(type, speed);
        }
        else {
            el.classList.add("done");
        }
    }
    type();
}
document.querySelectorAll(".typewriter").forEach((el) => runTypewriter(el));
//# sourceMappingURL=script.js.map