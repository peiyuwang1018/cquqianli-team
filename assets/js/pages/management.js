(() => {
  const tabset = document.querySelector('[data-management-tabset="section"]');
  if (!tabset) return;

  const tabs = Array.from(tabset.querySelectorAll(":scope > [data-management-tab]"));
  const panels = Array.from(document.querySelectorAll('[data-management-panel="section"]'));
  const compactLayout = window.matchMedia("(max-width: 1380px)");

  const syncOrientation = () => {
    tabset.setAttribute("aria-orientation", compactLayout.matches ? "horizontal" : "vertical");
  };

  const scrollToPanel = (panel, behavior = "smooth") => {
    const headerOffset = window.innerWidth <= 860 ? 136 : 104;
    const top = panel.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top: Math.max(0, top), behavior });
  };

  const activateTab = (tab, options = {}) => {
    const { focus = false, updateUrl = false, scroll = false, behavior = "smooth" } = options;
    const targetId = tab.dataset.managementTab;
    const panel = document.getElementById(targetId);
    if (!panel) return;

    tabs.forEach((item) => {
      const active = item === tab;
      item.setAttribute("aria-selected", String(active));
      item.tabIndex = active ? 0 : -1;
    });

    panels.forEach((item) => {
      item.hidden = item !== panel;
    });

    if (updateUrl) history.replaceState(null, "", `${location.pathname}${location.search}#${targetId}`);
    if (focus) tab.focus();
    if (scroll) requestAnimationFrame(() => scrollToPanel(panel, behavior));
  };

  const activateFromHash = (options = {}) => {
    const requestedId = location.hash.slice(1);
    const requestedTab = tabs.find((tab) => tab.dataset.managementTab === requestedId);
    if (!requestedTab) return false;
    activateTab(requestedTab, options);
    return true;
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      activateTab(tab, { updateUrl: true, scroll: true });
    });

    tab.addEventListener("keydown", (event) => {
      const horizontal = tabset.getAttribute("aria-orientation") === "horizontal";
      const previousKey = horizontal ? "ArrowLeft" : "ArrowUp";
      const nextKey = horizontal ? "ArrowRight" : "ArrowDown";
      let nextIndex = null;

      if (event.key === previousKey) nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === nextKey) nextIndex = (index + 1) % tabs.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = tabs.length - 1;
      if (nextIndex === null) return;

      event.preventDefault();
      activateTab(tabs[nextIndex], { focus: true, updateUrl: true, scroll: true });
    });
  });

  syncOrientation();
  compactLayout.addEventListener("change", syncOrientation);

  if (!activateFromHash()) {
    const initialTab = tabs.find((tab) => tab.getAttribute("aria-selected") === "true") || tabs[0];
    activateTab(initialTab);
  } else {
    requestAnimationFrame(() => {
      const panel = document.getElementById(location.hash.slice(1));
      if (panel) scrollToPanel(panel, "auto");
    });
  }

  window.addEventListener("hashchange", () => {
    activateFromHash({ scroll: true, behavior: "auto" });
  });
})();
