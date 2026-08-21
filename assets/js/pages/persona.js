(() => {
  const sections = [...document.querySelectorAll("[data-persona-section]")];
  if (!sections.length) return;

  const labels = {
    self: "面对自己",
    team: "面对团队",
    work: "面对工作"
  };
  const rail = document.createElement("nav");
  rail.className = "member-section-rail persona-section-rail";
  rail.setAttribute("aria-label", "人才画像特质导航");
  let lockedKey = "";
  let lockUntil = 0;

  const activate = (key) => {
    rail.querySelectorAll("button").forEach((button) => {
      const active = button.dataset.personaTarget === key;
      button.classList.toggle("is-active", active);
      if (active) button.setAttribute("aria-current", "true");
      else button.removeAttribute("aria-current");
    });
  };

  sections.forEach((section, index) => {
    const key = section.dataset.personaSection;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `persona-rail-${key}`;
    button.dataset.personaTarget = key;
    button.setAttribute("aria-label", `前往${labels[key]}`);
    button.innerHTML = `<span aria-hidden="true"></span><b>${String(index + 1).padStart(2, "0")}</b><em>${labels[key]}</em>`;
    button.addEventListener("click", () => {
      lockedKey = key;
      lockUntil = performance.now() + 900;
      activate(key);
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const top = section.getBoundingClientRect().top + window.scrollY - 104;
      window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
      window.setTimeout(() => {
        lockedKey = "";
        sync();
      }, 940);
    });
    rail.appendChild(button);
  });
  document.body.appendChild(rail);

  let frame = 0;
  function sync() {
    if (lockedKey && performance.now() < lockUntil) {
      activate(lockedKey);
      return;
    }
    const probe = window.scrollY + Math.min(window.innerHeight * 0.36, 340);
    let current = sections[0];
    sections.forEach((section) => {
      if (section.offsetTop <= probe) current = section;
    });
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) {
      current = sections.at(-1);
    }
    activate(current.dataset.personaSection);
  }

  const requestSync = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      sync();
    });
  };

  window.addEventListener("scroll", requestSync, { passive: true });
  window.addEventListener("resize", requestSync);
  sync();
})();
