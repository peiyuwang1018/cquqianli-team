(() => {
  const nav = document.querySelector("[data-join-answer-nav]");
  const list = nav?.querySelector(".join-answer-nav-list");
  const items = [...document.querySelectorAll(".join-awareness-item, .join-check-item")];
  if (!nav || !list || items.length !== 16) {
    nav?.setAttribute("hidden", "");
    return;
  }

  const buttons = items.map((item, index) => {
    const number = String(index + 1).padStart(2, "0");
    const title = item.querySelector("strong")?.textContent.trim() || `第 ${number} 项`;
    const id = `application-check-${number}`;
    item.id = id;

    const entry = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.label = `${number} · ${title}`;
    button.setAttribute("aria-label", `前往第 ${number} 项：${title}`);
    button.setAttribute("aria-controls", id);
    button.innerHTML = '<img src="assets/images/brand/group-icons/robomaster.svg" alt="" aria-hidden="true" />';
    button.addEventListener("click", () => {
      item.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "center"
      });
    });
    entry.append(button);
    list.append(entry);
    return button;
  });

  let activeIndex = -1;
  let ticking = false;

  const setActive = (index) => {
    if (index === activeIndex) return;
    activeIndex = index;
    buttons.forEach((button, buttonIndex) => {
      const active = buttonIndex === index;
      button.classList.toggle("is-active", active);
      if (active) button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
    });
  };

  const updateActive = () => {
    ticking = false;
    const guideLine = window.innerHeight * 0.48;
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;
    items.forEach((item, index) => {
      const bounds = item.getBoundingClientRect();
      const itemLine = bounds.top + Math.min(bounds.height * 0.5, 52);
      const distance = Math.abs(itemLine - guideLine);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });
    setActive(nearestIndex);
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateActive);
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  updateActive();
})();
