(() => {
  const dialog = document.querySelector("[data-culture-report-dialog]");
  const openButton = document.querySelector("[data-culture-report-open]");
  const closeButton = dialog?.querySelector("[data-culture-report-close]");
  const content = dialog?.querySelector("[data-culture-report-content]");
  const tocButtons = [...(dialog?.querySelectorAll("[data-report-target]") || [])];
  const sections = [...(dialog?.querySelectorAll("[data-culture-report-section]") || [])];

  if (!dialog || !openButton || !closeButton || !content) return;

  const setActiveSection = (id) => {
    tocButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.reportTarget === id);
    });
  };

  const closeReport = () => {
    if (dialog.open) dialog.close();
    document.documentElement.classList.remove("has-culture-report");
  };

  openButton.addEventListener("click", () => {
    content.scrollTop = 0;
    setActiveSection(sections[0]?.id);
    dialog.showModal();
    document.documentElement.classList.add("has-culture-report");
  });

  closeButton.addEventListener("click", closeReport);
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeReport();
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeReport();
  });
  dialog.addEventListener("close", () => {
    document.documentElement.classList.remove("has-culture-report");
  });

  tocButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const section = dialog.querySelector(`#${button.dataset.reportTarget}`);
      section?.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(button.dataset.reportTarget);
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveSection(visible.target.id);
    },
    { root: content, rootMargin: "-12% 0px -68%", threshold: [0.05, 0.25, 0.5] },
  );

  sections.forEach((section) => observer.observe(section));
})();
