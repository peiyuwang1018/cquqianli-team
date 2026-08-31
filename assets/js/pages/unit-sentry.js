(() => {
  const links = [...document.querySelectorAll("[data-ground-nav]")];
  const sections = [...document.querySelectorAll("[data-ground-section]")];
  if (!links.length || !sections.length) return;

  const sectionById = new Map(sections.map((section) => [section.dataset.groundSection, section]));

  const setActive = (requestedId) => {
    const id = sectionById.has(requestedId) ? requestedId : "infantry";
    links.forEach((link) => {
      const active = link.dataset.groundNav === id;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  };

  links.forEach((link, index) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const id = link.dataset.groundNav;
      const section = sectionById.get(id);
      setActive(id);
      history.replaceState(null, "", link.hash);
      section?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    link.addEventListener("keydown", (event) => {
      if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const direction = ["ArrowDown", "ArrowRight"].includes(event.key) ? 1 : -1;
      const next = links[(index + direction + links.length) % links.length];
      next.focus();
      next.click();
    });
  });

  const syncActiveToScroll = () => {
    const marker = window.scrollY + Math.min(window.innerHeight * 0.32, 340);
    let current = sections[0];
    sections.forEach((section) => {
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      if (sectionTop <= marker) current = section;
    });
    setActive(current.dataset.groundSection);
  };

  let scrollFrame = 0;
  window.addEventListener("scroll", () => {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(() => {
      scrollFrame = 0;
      syncActiveToScroll();
    });
  }, { passive: true });

  setActive(window.location.hash === "#unit-sentry" ? "sentry" : "infantry");
  window.requestAnimationFrame(syncActiveToScroll);
})();
