(() => {
  const links = [...document.querySelectorAll("[data-ground-nav]")];
  const sections = [...document.querySelectorAll("[data-ground-section]")];
  if (!links.length || !sections.length) return;

  const header = document.querySelector(".site-header");
  const rail = document.querySelector(".ground-rail");
  const sectionById = new Map(sections.map((section) => [section.dataset.groundSection, section]));
  let navigationLock = "";
  let navigationTimer = 0;

  const getScrollOffset = () => {
    const headerHeight = header?.getBoundingClientRect().height || 0;
    const railIsSticky = rail && window.getComputedStyle(rail).position === "sticky";
    const railHeight = railIsSticky ? rail.getBoundingClientRect().height : 0;
    return headerHeight + railHeight + 18;
  };

  const setActive = (requestedId) => {
    const id = sectionById.has(requestedId) ? requestedId : "infantry";
    links.forEach((link) => {
      const active = link.dataset.groundNav === id;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  };

  const scrollToSection = (section, behavior = "smooth") => {
    const top = section.getBoundingClientRect().top + window.scrollY - getScrollOffset();
    window.scrollTo({ top: Math.max(0, top), behavior });
  };

  const releaseNavigationLock = () => {
    if (!navigationLock) return;
    navigationLock = "";
    window.clearTimeout(navigationTimer);
    syncActiveToScroll();
  };

  links.forEach((link, index) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const id = link.dataset.groundNav;
      const section = sectionById.get(id);
      if (!section) return;
      navigationLock = id;
      setActive(id);
      const nextUrl = `${window.location.pathname}${window.location.search}${link.hash}`;
      history.replaceState(null, "", nextUrl);
      scrollToSection(section);
      window.clearTimeout(navigationTimer);
      navigationTimer = window.setTimeout(releaseNavigationLock, 1200);
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
    if (navigationLock) {
      setActive(navigationLock);
      return;
    }
    const marker = window.scrollY + getScrollOffset() + 32;
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

  if ("onscrollend" in window) {
    window.addEventListener("scrollend", releaseNavigationLock, { passive: true });
  }

  window.addEventListener("resize", syncActiveToScroll, { passive: true });

  const initialId = window.location.hash === "#unit-sentry" ? "sentry" : "infantry";
  setActive(initialId);
  window.requestAnimationFrame(() => {
    const initialSection = window.location.hash ? sectionById.get(initialId) : null;
    if (initialSection) scrollToSection(initialSection, "auto");
    syncActiveToScroll();
  });
})();
