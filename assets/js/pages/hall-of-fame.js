(() => {
  const tabs = [...document.querySelectorAll("[data-hall-tab]")];
  const panels = [...document.querySelectorAll("[data-hall-panel]")];
  if (!tabs.length || !panels.length) return;

  const activate = (key, updateHash = true) => {
    tabs.forEach((tab) => {
      const active = tab.dataset.hallTab === key;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.hallPanel !== key;
    });
    if (updateHash) history.replaceState(null, "", `#${key}`);
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activate(tab.dataset.hallTab));
    tab.addEventListener("keydown", (event) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length : (index - 1 + tabs.length) % tabs.length;
      activate(tabs[next].dataset.hallTab);
      tabs[next].focus();
    });
  });

  const initial = location.hash.replace("#", "");
  activate(tabs.some((tab) => tab.dataset.hallTab === initial) ? initial : "legacy", false);

  const alumniFilter = document.querySelector("#alumni-group-filter");
  const alumniCards = [...document.querySelectorAll("[data-alumni-card]")];
  const alumniPeriods = [...document.querySelectorAll("[data-alumni-period]")];
  const alumniEmpty = document.querySelector("#alumni-empty");

  const applyAlumniFilter = (group) => {
    alumniCards.forEach((card) => {
      const groups = (card.dataset.groups || "").split(/\s+/).filter(Boolean);
      card.hidden = group !== "all" && !groups.includes(group);
    });

    alumniPeriods.forEach((period) => {
      period.hidden = !period.querySelector("[data-alumni-card]:not([hidden])");
    });

    if (alumniEmpty) {
      alumniEmpty.hidden = alumniCards.some((card) => !card.hidden);
    }
  };

  alumniFilter?.addEventListener("change", () => applyAlumniFilter(alumniFilter.value));
  applyAlumniFilter(alumniFilter?.value || "all");
})();
