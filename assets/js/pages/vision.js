(() => {
  const tabs = Array.from(document.querySelectorAll("[data-vision-project-tab]"));
  const panels = Array.from(document.querySelectorAll("[data-vision-project-panel]"));

  if (!tabs.length || !panels.length) return;

  const activateProject = (tab, options = {}) => {
    const { focus = false, updateUrl = false } = options;
    const targetId = tab.dataset.visionProjectTab;

    tabs.forEach((item) => {
      const active = item === tab;
      item.setAttribute("aria-selected", String(active));
      item.tabIndex = active ? 0 : -1;
    });

    panels.forEach((panel) => {
      const active = panel.id === targetId;
      panel.hidden = !active;

      if (!active) {
        panel.querySelectorAll("video").forEach((video) => video.pause());
      }
    });

    if (updateUrl) history.replaceState(null, "", `#${targetId}`);
    if (focus) tab.focus();
  };

  const requestedId = location.hash.slice(1);
  const initialTab = tabs.find((tab) => tab.dataset.visionProjectTab === requestedId) || tabs[0];
  activateProject(initialTab);

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateProject(tab, { updateUrl: true }));
    tab.addEventListener("keydown", (event) => {
      let nextIndex = null;

      if (["ArrowUp", "ArrowLeft"].includes(event.key)) nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (["ArrowDown", "ArrowRight"].includes(event.key)) nextIndex = (index + 1) % tabs.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = tabs.length - 1;
      if (nextIndex === null) return;

      event.preventDefault();
      activateProject(tabs[nextIndex], { focus: true, updateUrl: true });
    });
  });
})();
