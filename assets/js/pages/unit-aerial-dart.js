(() => {
  const links = [...document.querySelectorAll("[data-air-dart-nav]")];
  const sections = [...document.querySelectorAll("[data-air-dart-section]")];
  if (!links.length || !sections.length) return;

  const validIds = new Set(sections.map((section) => section.dataset.airDartSection));

  const setActive = (requestedId, { updateHash = false, scroll = false } = {}) => {
    const id = validIds.has(requestedId) ? requestedId : "aerial";
    let activeSection = null;

    links.forEach((link) => {
      const active = link.dataset.airDartNav === id;
      link.classList.toggle("is-active", active);
      link.setAttribute("aria-selected", String(active));
      link.tabIndex = active ? 0 : -1;
    });

    sections.forEach((section) => {
      const active = section.dataset.airDartSection === id;
      section.hidden = !active;
      if (active) activeSection = section;
    });

    if (updateHash) history.replaceState(null, "", `#unit-${id}`);
    if (scroll && activeSection) activeSection.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  links.forEach((link, index) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      setActive(link.dataset.airDartNav, { updateHash: true, scroll: true });
    });

    link.addEventListener("keydown", (event) => {
      if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const direction = ["ArrowDown", "ArrowRight"].includes(event.key) ? 1 : -1;
      const next = links[(index + direction + links.length) % links.length];
      next.focus();
      setActive(next.dataset.airDartNav, { updateHash: true, scroll: true });
    });
  });

  window.addEventListener("hashchange", () => {
    const id = window.location.hash === "#unit-dart" ? "dart" : "aerial";
    setActive(id);
  });

  const initial = window.location.hash === "#unit-dart" ? "dart" : "aerial";
  setActive(initial);
})();
