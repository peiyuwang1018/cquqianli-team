(() => {
  const tabsets = document.querySelectorAll("[data-mechanical-tabset]");

  const activateTab = (tabset, tab, options = {}) => {
    const { focus = false, updateUrl = false } = options;
    const group = tabset.dataset.mechanicalTabset;
    const tabs = Array.from(tabset.querySelectorAll(":scope > [data-mechanical-tab]"));
    const panels = Array.from(document.querySelectorAll(`[data-mechanical-panel="${group}"]`));
    const targetId = tab.dataset.mechanicalTab;

    tabs.forEach((item) => {
      const active = item === tab;
      item.setAttribute("aria-selected", String(active));
      item.tabIndex = active ? 0 : -1;
    });

    panels.forEach((panel) => {
      panel.hidden = panel.id !== targetId;
    });

    if (group === "section" && updateUrl) {
      history.replaceState(null, "", `#${targetId}`);
    }

    if (focus) tab.focus();
  };

  tabsets.forEach((tabset) => {
    const tabs = Array.from(tabset.querySelectorAll(":scope > [data-mechanical-tab]"));
    if (!tabs.length) return;

    const requestedPanel = location.hash.slice(1);
    const initialTab =
      (tabset.dataset.mechanicalTabset === "section" && tabs.find((tab) => tab.dataset.mechanicalTab === requestedPanel)) ||
      tabs.find((tab) => tab.getAttribute("aria-selected") === "true") ||
      tabs[0];

    activateTab(tabset, initialTab);

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activateTab(tabset, tab, { updateUrl: tabset.dataset.mechanicalTabset === "section" }));
      tab.addEventListener("keydown", (event) => {
        const vertical = tabset.getAttribute("aria-orientation") === "vertical";
        const previousKey = vertical ? "ArrowUp" : "ArrowLeft";
        const nextKey = vertical ? "ArrowDown" : "ArrowRight";
        let nextIndex = null;

        if (event.key === previousKey) nextIndex = (index - 1 + tabs.length) % tabs.length;
        if (event.key === nextKey) nextIndex = (index + 1) % tabs.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = tabs.length - 1;
        if (nextIndex === null) return;

        event.preventDefault();
        activateTab(tabset, tabs[nextIndex], {
          focus: true,
          updateUrl: tabset.dataset.mechanicalTabset === "section",
        });
      });
    });
  });

  const recruitmentBoard = document.querySelector("[data-recruitment-board]");
  const recruitmentDialog = document.querySelector("[data-recruitment-dialog]");
  const recruitmentOpenButton = document.querySelector("[data-recruitment-open]");
  const recruitmentCloseButton = document.querySelector("[data-recruitment-close]");

  if (recruitmentDialog && recruitmentOpenButton && recruitmentCloseButton) {
    recruitmentOpenButton.addEventListener("click", () => {
      if (typeof recruitmentDialog.showModal === "function") {
        recruitmentDialog.showModal();
      } else {
        recruitmentDialog.setAttribute("open", "");
      }
      recruitmentCloseButton.focus();
    });

    recruitmentCloseButton.addEventListener("click", () => {
      if (typeof recruitmentDialog.close === "function") recruitmentDialog.close();
      else recruitmentDialog.removeAttribute("open");
    });

    recruitmentDialog.addEventListener("click", (event) => {
      if (event.target !== recruitmentDialog) return;
      if (typeof recruitmentDialog.close === "function") recruitmentDialog.close();
      else recruitmentDialog.removeAttribute("open");
    });
  }

  if (recruitmentBoard) {
    const cases = Array.from(recruitmentBoard.querySelectorAll("[data-recruitment-case]"));
    const previousButton = recruitmentBoard.querySelector("[data-recruitment-prev]");
    const nextButton = recruitmentBoard.querySelector("[data-recruitment-next]");
    const progress = recruitmentBoard.querySelector("[data-recruitment-progress]");
    let activeIndex = 0;

    const showCase = (requestedIndex) => {
      activeIndex = (requestedIndex + cases.length) % cases.length;
      cases.forEach((item, index) => {
        item.hidden = index !== activeIndex;
      });
      progress.value = `${String(activeIndex + 1).padStart(2, "0")} / ${String(cases.length).padStart(2, "0")}`;
    };

    if (cases.length && previousButton && nextButton && progress) {
      previousButton.addEventListener("click", () => showCase(activeIndex - 1));
      nextButton.addEventListener("click", () => showCase(activeIndex + 1));
      showCase(0);
    }
  }

  const careerFlipCards = Array.from(document.querySelectorAll("[data-career-flip]"));

  careerFlipCards.forEach((card) => {
    card.addEventListener("click", () => {
      const willFlip = !card.classList.contains("is-flipped");

      careerFlipCards.forEach((item) => {
        item.classList.remove("is-flipped");
        item.setAttribute("aria-pressed", "false");
      });

      if (willFlip) {
        card.classList.add("is-flipped");
        card.setAttribute("aria-pressed", "true");
      }
    });
  });
})();
